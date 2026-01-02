
import React, { useState } from 'react';
import { db } from '../services/supabaseMock';
import { EXPENSE_CATEGORIES } from '../constants.tsx';

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState(db.getExpenses());
  
  const [formData, setFormData] = useState({ 
    description: '', 
    value: 0, 
    category: EXPENSE_CATEGORIES[0], 
    date: new Date().toISOString().split('T')[0],
    payment_method: 'Pix' 
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || formData.value <= 0) return alert('Campos obrigatórios: Descrição e Valor');
    db.addExpense(formData);
    setExpenses(db.getExpenses());
    setFormData({ 
      description: '', 
      value: 0, 
      category: EXPENSE_CATEGORIES[0], 
      date: new Date().toISOString().split('T')[0],
      payment_method: 'Pix' 
    });
    alert('Despesa registrada!');
  };

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const totalMonthly = expenses.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f6f6]">
      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-6 md:gap-8 items-start">
        <div className="flex-1 w-full flex flex-col gap-6">
          <header className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-[#4a1d35] mb-2">Registro de Despesas</h1>
            <p className="text-xs md:text-sm text-gray-500">Controle suas saídas financeiras.</p>
          </header>

          <div className="bg-white rounded-2xl p-5 md:p-8 shadow-sm border border-[#e6dbdf]">
            <form onSubmit={handleAdd} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-gray-700 font-bold text-xs uppercase">Data</span>
                  <input 
                    type="date" 
                    className="h-11 rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c] text-sm" 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-gray-700 font-bold text-xs uppercase">Valor (R$)</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="h-11 rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c] font-bold text-base" 
                    placeholder="0,00"
                    value={formData.value || ''}
                    onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-gray-700 font-bold text-xs uppercase">Descrição</span>
                <input 
                  className="h-11 rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c] text-sm" 
                  placeholder="Ex: Conta de luz, Aluguel..." 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="flex flex-col gap-1.5">
                  <span className="text-gray-700 font-bold text-xs uppercase">Categoria</span>
                  <select 
                    className="h-11 rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c] text-sm"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    {EXPENSE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-gray-700 font-bold text-xs uppercase">Pagamento</span>
                  <select 
                    className="h-11 rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c] text-sm"
                    value={formData.payment_method}
                    onChange={e => setFormData({...formData, payment_method: e.target.value})}
                  >
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão">Cartão</option>
                  </select>
                </label>
              </div>

              <div className="pt-2 border-t border-gray-50 flex">
                <button type="submit" className="w-full h-12 bg-[#ee2b6c] hover:bg-[#d41b55] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">check</span> Salvar Despesa
                </button>
              </div>
            </form>
          </div>
        </div>

        <aside className="w-full lg:w-[320px] flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#4a1d96] to-[#2e0e36] rounded-2xl p-6 text-white shadow-xl">
            <h3 className="font-medium text-white/80 text-xs mb-1 uppercase tracking-wider">Total do Mês</h3>
            <p className="text-2xl md:text-3xl font-bold">{formatCurrency(totalMonthly)}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e6dbdf]">
            <h3 className="text-sm font-bold mb-4 uppercase text-[#4a1d35] tracking-wider">Lançamentos Recentes</h3>
            <div className="space-y-4">
              {expenses.slice(-5).reverse().map(exp => (
                <div key={exp.id} className="flex items-center gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="size-9 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px]">south_east</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate text-gray-800">{exp.description}</p>
                    <p className="text-[10px] text-gray-500">{new Date(exp.date).toLocaleDateString()}</p>
                  </div>
                  <p className="text-xs font-bold text-red-600">-{formatCurrency(exp.value)}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Expenses;
