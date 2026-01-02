
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../services/supabaseMock';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const sales = db.getSales();
  const expenses = db.getExpenses();
  const installments = db.getInstallments();
  const products = db.getProducts();

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const today = now.toISOString().split('T')[0];
    
    const filterByMonth = (items: any[], month: number, year: number) => 
      items.filter(i => {
        const d = new Date(i.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });

    const thisMonthSales = filterByMonth(sales, currentMonth, currentYear);
    const lastMonthSales = filterByMonth(sales, lastMonth, lastMonthYear);
    
    const todayIncome = sales
      .filter(s => s.date.startsWith(today))
      .reduce((acc, s) => acc + s.total_value, 0);
    
    const todayExpenses = expenses
      .filter(e => e.date.startsWith(today))
      .reduce((acc, e) => acc + e.value, 0);

    const monthlyIncome = thisMonthSales.reduce((acc, s) => acc + s.total_value, 0);
    const lastMonthlyIncome = lastMonthSales.reduce((acc, s) => acc + s.total_value, 0);
    
    const monthlyExpenses = filterByMonth(expenses, currentMonth, currentYear).reduce((acc, e) => acc + e.value, 0);
    
    const pendingCredit = installments
      .filter(i => i.status !== 'paid')
      .reduce((acc, i) => acc + i.value, 0);

    const pendingClients = new Set(installments.filter(i => i.status !== 'paid').map(i => i.customer_id)).size;

    const growth = lastMonthlyIncome === 0 ? 100 : ((monthlyIncome - lastMonthlyIncome) / lastMonthlyIncome) * 100;

    const totalStockValue = products.reduce((acc, p) => acc + (p.sale_price * p.stock), 0);

    return { 
      todayIncome, todayExpenses, 
      monthlyBalance: monthlyIncome - monthlyExpenses,
      monthlyIncome,
      pendingCredit, pendingClients,
      growth,
      totalStockValue
    };
  }, [sales, expenses, installments, products]);

  const chartData = [
    { name: '01/10', entries: 400, exits: 240 },
    { name: '05/10', entries: 300, exits: 139 },
    { name: '10/10', entries: 200, exits: 980 },
    { name: '15/10', entries: 278, exits: 390 },
    { name: '20/10', entries: 189, exits: 480 },
    { name: '25/10', entries: 239, exits: 380 },
    { name: '30/10', entries: 349, exits: 430 },
  ];

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f6f6]">
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 md:gap-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#4a1d35]">Visão Geral</h2>
            <p className="text-xs md:text-sm text-gray-500">Resumo financeiro e comparativo</p>
          </div>
          <Link to="/vendas" className="bg-[#ee2b6c] hover:bg-[#d41b55] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">add</span> Nova Venda
          </Link>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="Faturamento Mês" value={formatCurrency(stats.monthlyIncome)} trend={`${stats.growth.toFixed(1)}%`} type={stats.growth >= 0 ? 'up' : 'down'} subtitle="vs. mês anterior" />
          <StatCard title="Patrimônio Estoque" value={formatCurrency(stats.totalStockValue)} trend="Ativo" type="balance" subtitle="Valor total p/ venda" />
          <StatCard title="Saldo em Caixa" value={formatCurrency(stats.monthlyBalance)} trend="+8%" type="balance" subtitle="Este mês" />
          <div className="bg-gradient-to-br from-[#ee2b6c] to-[#4a1d96] p-5 md:p-6 rounded-2xl shadow-lg text-white relative overflow-hidden group">
            <p className="text-white/90 text-xs md:text-sm font-medium">Em Crediário</p>
            <h3 className="text-2xl md:text-3xl font-bold text-white mt-1">{formatCurrency(stats.pendingCredit)}</h3>
            <div className="flex justify-between items-end mt-3">
              <span className="text-white/80 text-[10px] md:text-xs font-medium bg-black/20 px-2 py-1 rounded-md">{stats.pendingClients} clientes</span>
              <Link to="/crediario" className="text-[10px] md:text-xs font-bold bg-white text-[#ee2b6c] px-3 py-1.5 rounded-lg shadow-sm">
                Ver Tudo
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-6">Desempenho Financeiro (Vendas)</h3>
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ee2b6c" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#ee2b6c" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                  <Tooltip />
                  <Area type="monotone" dataKey="entries" stroke="#ee2b6c" strokeWidth={3} fillOpacity={1} fill="url(#colorEntries)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-xs font-bold text-gray-900 mb-4 uppercase tracking-wider">Ações Rápidas</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link to="/vendas" className="flex flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-xl bg-gray-50 hover:bg-[#ee2b6c]/5 hover:text-[#ee2b6c] border border-gray-100 transition-all">
                  <span className="material-symbols-outlined text-gray-600">add_shopping_cart</span>
                  <span className="text-[10px] md:text-xs font-semibold">Venda</span>
                </Link>
                <Link to="/despesas" className="flex flex-col items-center justify-center gap-2 p-3 md:p-4 rounded-xl bg-gray-50 hover:bg-[#4a1d96]/5 hover:text-[#4a1d96] border border-gray-100 transition-all">
                  <span className="material-symbols-outlined text-gray-600">receipt</span>
                  <span className="text-[10px] md:text-xs font-semibold">Despesa</span>
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1 flex flex-col min-h-[300px]">
              <div className="p-4 md:p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-base md:text-lg font-bold text-gray-900">Últimas Vendas</h3>
              </div>
              <div className="flex-1 overflow-auto">
                {sales.slice(-5).reverse().map(sale => (
                  <div key={sale.id} className="p-3 md:p-4 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-pink-100 flex items-center justify-center text-[#ee2b6c] text-[10px] font-bold">
                        {sale.payment_method[0]}
                      </div>
                      <div>
                        <p className="text-xs md:text-sm font-semibold text-gray-900">Venda #{sale.id.slice(0, 4)}</p>
                        <p className="text-[10px] text-gray-500">{new Date(sale.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm font-bold text-gray-900">{formatCurrency(sale.total_value)}</p>
                      <span className="text-[8px] md:text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded border border-gray-200">{sale.payment_method}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, trend, type, subtitle }: { title: string, value: string, trend: string, type: 'up' | 'down' | 'balance', subtitle: string }) => {
  const isUp = type === 'up';
  const isDown = type === 'down';
  const icon = isUp ? 'trending_up' : isDown ? 'trending_down' : 'account_balance_wallet';
  const colorClass = isUp ? 'text-green-600' : isDown ? 'text-red-500' : 'text-purple-600';
  const bgColorClass = isUp ? 'bg-green-50' : isDown ? 'bg-red-50' : 'bg-purple-50';

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
        <span className={`material-symbols-outlined text-5xl md:text-6xl ${colorClass}`}>{icon}</span>
      </div>
      <div className="flex flex-col gap-1 z-10 relative">
        <p className="text-gray-500 text-[10px] md:text-sm font-medium uppercase tracking-tight">{title}</p>
        <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">{value}</h3>
        <div className="flex items-center gap-1 mt-1 md:mt-2">
          <span className={`${bgColorClass} ${colorClass} text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center`}>
            {trend}
          </span>
          <span className="text-gray-400 text-[10px]">{subtitle}</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
