
import React, { useState, useMemo } from 'react';
import { db } from '../services/supabaseMock';

const Credit: React.FC = () => {
  const [installments, setInstallments] = useState(db.getInstallments());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all');

  const customers = db.getCustomers();

  const filtered = useMemo(() => {
    return installments.filter(i => {
      const customer = customers.find(c => c.id === i.customer_id);
      const matchesSearch = 
        customer?.name.toLowerCase().includes(search.toLowerCase()) || 
        customer?.phone.includes(search);
      const matchesFilter = filter === 'all' ? true : i.status === filter;
      return matchesSearch && matchesFilter;
    }).sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [installments, search, filter, customers]);

  const handlePay = (id: string, value: number) => {
    if (!confirm('Confirmar recebimento desta parcela?')) return;
    db.payInstallment(id, value);
    setInstallments(db.getInstallments());
    alert('Pagamento registrado com sucesso!');
  };

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  const stats = useMemo(() => {
    const totalPending = installments.filter(i => i.status !== 'paid').reduce((a, b) => a + Number(b.value), 0);
    const totalOverdue = installments.filter(i => i.status === 'overdue').reduce((a, b) => a + Number(b.value), 0);
    const countOverdue = installments.filter(i => i.status === 'overdue').length;
    return { totalPending, totalOverdue, countOverdue };
  }, [installments]);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f6f6]">
      <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-8">
        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#4a1d96] tracking-tight">Gestão de Crediário</h1>
          <p className="text-sm text-gray-500">Controle individual de parcelas de todas as vendas.</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white p-6 rounded-2xl border border-pink-100 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total em Aberto</span>
              <span className="material-symbols-outlined text-[#ee2b6c] bg-pink-50 p-2 rounded-xl">account_balance_wallet</span>
            </div>
            <h3 className="text-3xl font-black text-gray-900">{formatCurrency(stats.totalPending)}</h3>
            <p className="text-[10px] text-gray-400 font-medium">Soma de todas as parcelas não pagas</p>
          </div>

          <div className={`bg-white p-6 rounded-2xl border shadow-sm flex flex-col gap-2 transition-colors ${stats.countOverdue > 0 ? 'border-red-200 bg-red-50/30' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Vencido</span>
              <span className={`material-symbols-outlined p-2 rounded-xl ${stats.countOverdue > 0 ? 'text-red-600 bg-red-100' : 'text-gray-400 bg-gray-100'}`}>warning</span>
            </div>
            <h3 className={`text-3xl font-black ${stats.countOverdue > 0 ? 'text-red-600' : 'text-gray-900'}`}>{formatCurrency(stats.totalOverdue)}</h3>
            <p className="text-[10px] text-gray-400 font-medium uppercase">{stats.countOverdue} parcelas em atraso</p>
          </div>

          <div className="hidden lg:flex bg-gradient-to-br from-[#4a1d96] to-[#ee2b6c] p-6 rounded-2xl text-white shadow-lg flex-col justify-center">
            <p className="text-xs font-bold uppercase opacity-80 mb-1">Dica de Gestão</p>
            <p className="text-sm font-medium leading-relaxed">Mantenha o cadastro das clientes atualizado para facilitar cobranças via WhatsApp.</p>
          </div>
        </section>

        <section className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              className="w-full pl-10 pr-4 h-11 rounded-lg border-gray-200 bg-gray-50 text-sm focus:ring-[#ee2b6c]/30" 
              placeholder="Buscar por cliente ou telefone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>Todas</FilterButton>
            <FilterButton active={filter === 'pending'} onClick={() => setFilter('pending')}>Pendentes</FilterButton>
            <FilterButton active={filter === 'overdue'} onClick={() => setFilter('overdue')} overdue>Vencidas</FilterButton>
            <FilterButton active={filter === 'paid'} onClick={() => setFilter('paid')} paid>Pagas</FilterButton>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="py-4 px-6 text-[10px] font-bold text-[#4a1d96] uppercase tracking-wider">Cliente / WhatsApp</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-[#4a1d96] uppercase tracking-wider text-center">Parcela</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-[#4a1d96] uppercase tracking-wider">Vencimento</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-[#4a1d96] uppercase tracking-wider text-right">Valor</th>
                  <th className="py-4 px-6 text-[10px] font-bold text-[#4a1d96] uppercase tracking-wider text-center">Status</th>
                  <th className="py-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(i => {
                  const customer = customers.find(c => c.id === i.customer_id);
                  const isOverdue = i.status === 'overdue';
                  return (
                    <tr key={i.id} className="hover:bg-pink-50/5 transition-colors group">
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{customer?.name || 'Cliente Removido'}</p>
                          <p className="text-[10px] text-gray-500">{customer?.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center text-xs font-bold text-gray-500">
                        {i.number}
                      </td>
                      <td className={`py-4 px-6 text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
                        {new Date(i.due_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-6 text-sm font-bold text-right text-[#4a1d96]">{formatCurrency(i.value)}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter border shadow-sm ${
                          i.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          i.status === 'overdue' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {i.status === 'paid' ? 'Paga' : i.status === 'overdue' ? 'Vencida' : 'Aberta'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {i.status !== 'paid' && (
                          <button 
                            onClick={() => handlePay(i.id, i.value)}
                            className="bg-[#ee2b6c] hover:bg-[#d41b55] text-white text-[10px] font-black uppercase px-4 py-2 rounded-lg transition-all shadow-sm active:scale-95"
                          >
                            Receber
                          </button>
                        )}
                        {i.status === 'paid' && (
                           <div className="flex items-center justify-end text-emerald-600 gap-1">
                             <span className="material-symbols-outlined text-lg filled">check_circle</span>
                             <span className="text-[10px] font-black uppercase">Recebido</span>
                           </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 text-sm italic">Nenhuma parcela pendente.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

const FilterButton = ({ children, active, onClick, overdue, paid }: any) => {
  const activeClass = active 
    ? (overdue ? 'bg-red-600 text-white shadow-red-200' : paid ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-[#4a1d96] text-white shadow-purple-200')
    : 'bg-white text-gray-600 border-gray-200 hover:border-[#ee2b6c] hover:text-[#ee2b6c]';
  
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all shadow-sm ${activeClass}`}
    >
      {children}
    </button>
  );
};

export default Credit;
