
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Customers from './pages/Customers';
import Credit from './pages/Credit';
import Expenses from './pages/Expenses';
import Stock from './pages/Stock';
import Reports from './pages/Reports';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f8f6f6] p-4">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
          <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#ee2b6c] to-[#4a1d96] p-12 text-white flex-col justify-between relative overflow-hidden">
            <div className="z-10">
               <div className="flex items-center gap-2 mb-10">
                <span className="material-symbols-outlined text-4xl">checkroom</span>
                <span className="text-xl font-bold">Bico Fino</span>
              </div>
              <h1 className="text-4xl font-extrabold mb-4 leading-tight">Gestão Financeira com Estilo.</h1>
              <p className="opacity-90">Controle seu fluxo de caixa e vendas em um só lugar.</p>
            </div>
            <p className="z-10 text-sm opacity-60">© 2024 Bico Fino Roupas & Acessórios</p>
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover" alt="Fashion" />
            </div>
          </div>
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-black text-[#4a1d96] mb-2">Bem-vindo de volta</h2>
            <p className="text-gray-500 mb-8">Acesse o painel financeiro da Bico Fino</p>
            <form onSubmit={(e) => { e.preventDefault(); setIsAuthenticated(true); }} className="space-y-4">
              <input className="w-full h-12 rounded-xl border-gray-200 focus:ring-[#ee2b6c]" placeholder="E-mail" type="email" />
              <input className="w-full h-12 rounded-xl border-gray-200 focus:ring-[#ee2b6c]" placeholder="Senha" type="password" />
              <button className="w-full h-14 bg-[#ee2b6c] hover:bg-[#d41b55] text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">Entrar</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex h-screen bg-[#f8f6f6] overflow-hidden flex-col lg:flex-row">
        {/* Mobile Top Header */}
        <header className="lg:hidden h-16 bg-[#4a1d35] flex items-center justify-between px-4 shrink-0 z-30 shadow-md">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="text-white p-2"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#ee2b6c] text-2xl">checkroom</span>
            <span className="text-white font-bold text-lg">Bico Fino</span>
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </header>

        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vendas" element={<Sales />} />
            <Route path="/clientes" element={<Customers />} />
            <Route path="/crediario" element={<Credit />} />
            <Route path="/despesas" element={<Expenses />} />
            <Route path="/estoque" element={<Stock />} />
            <Route path="/relatorios" element={<Reports />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
