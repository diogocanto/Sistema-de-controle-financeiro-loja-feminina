
import React, { useState, useMemo } from 'react';
import { db } from '../services/supabaseMock';
import { CATEGORIES } from '../constants.tsx';
import { Product } from '../types';

const Stock: React.FC = () => {
  const [products, setProducts] = useState(db.getProducts());
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState('');

  const [formData, setFormData] = useState<Omit<Product, 'id'>>({
    name: '',
    model: '',
    size: '',
    category: CATEGORIES[0],
    cost_price: 0,
    sale_price: 0,
    stock: 0
  });

  const filtered = useMemo(() => {
    return products.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.model.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // Cálculos de Total de Estoque
  const stockStats = useMemo(() => {
    return products.reduce((acc, p) => {
      acc.totalCost += (Number(p.cost_price) || 0) * (Number(p.stock) || 0);
      acc.totalSale += (Number(p.sale_price) || 0) * (Number(p.stock) || 0);
      acc.totalItems += (Number(p.stock) || 0);
      return acc;
    }, { totalCost: 0, totalSale: 0, totalItems: 0 });
  }, [products]);

  const handleAddOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.sale_price <= 0) return alert('Nome e Preço de Venda são obrigatórios');
    
    if (isEditing) {
      db.deleteProduct(isEditing.id);
      db.addProduct(formData);
    } else {
      db.addProduct(formData);
    }
    
    setProducts(db.getProducts());
    setIsAdding(false);
    setIsEditing(null);
    setFormData({
      name: '', model: '', size: '', category: CATEGORIES[0],
      cost_price: 0, sale_price: 0, stock: 0
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`⚠️ ATENÇÃO: Deseja realmente APAGAR o produto "${name}"?\n\nEsta ação removerá o item e atualizará o valor total do estoque.`)) {
      db.deleteProduct(id);
      setProducts(db.getProducts());
    }
  };

  const startEdit = (p: Product) => {
    setIsEditing(p);
    setFormData({
      name: p.name, model: p.model, size: p.size, category: p.category,
      cost_price: p.cost_price, sale_price: p.sale_price, stock: p.stock
    });
    setIsAdding(true);
  };

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f6f6]">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#4a1d35]">Gestão de Estoque</h1>
            <p className="text-sm text-gray-500">Controle de mercadorias e valor patrimonial.</p>
          </div>
          <button 
            onClick={() => { setIsEditing(null); setIsAdding(true); }}
            className="bg-[#ee2b6c] hover:bg-[#d41b55] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <span className="material-symbols-outlined">add_box</span> Novo Produto
          </button>
        </header>

        {/* Cards de Resumo de Estoque */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e6dbdf] shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total de Peças</p>
            <h4 className="text-2xl font-black text-[#4a1d96]">{stockStats.totalItems} <span className="text-sm font-medium text-gray-400">unidades</span></h4>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-[#e6dbdf] shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Investimento (Custo)</p>
            <h4 className="text-2xl font-black text-gray-700">{formatCurrency(stockStats.totalCost)}</h4>
          </div>
          <div className="bg-pink-50 p-5 rounded-2xl border border-pink-100 shadow-sm">
            <p className="text-[10px] font-bold text-[#ee2b6c] uppercase tracking-widest mb-1">Potencial de Venda</p>
            <h4 className="text-2xl font-black text-[#ee2b6c]">{formatCurrency(stockStats.totalSale)}</h4>
          </div>
        </div>

        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <form onSubmit={handleAddOrUpdate} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="bg-[#4a1d96] p-6 text-white flex justify-between items-center">
                <h3 className="text-xl font-bold">{isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h3>
                <button type="button" onClick={() => { setIsAdding(false); setIsEditing(null); }} className="text-white/80 hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1 md:col-span-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nome do Produto</span>
                  <input className="rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c]/20 h-11" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Modelo / Estilo</span>
                  <input className="rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c]/20 h-11" placeholder="Ex: Skinny, Gola V..." value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tamanho</span>
                  <input className="rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c]/20 h-11" placeholder="Ex: P, M, G, 42..." value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Categoria</span>
                  <select className="rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c]/20 h-11" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Quantidade em Estoque</span>
                  <input type="number" className="rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c]/20 h-11" value={formData.stock || ''} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preço de Custo (R$)</span>
                  <input type="number" step="0.01" className="rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c]/20 h-11" placeholder="0,00" value={formData.cost_price || ''} onChange={e => setFormData({...formData, cost_price: Number(e.target.value)})} />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Preço de Venda (R$)</span>
                  <input type="number" step="0.01" className="rounded-xl border-[#e6dbdf] focus:ring-[#ee2b6c]/20 h-11 font-bold text-[#ee2b6c]" placeholder="0,00" value={formData.sale_price || ''} onChange={e => setFormData({...formData, sale_price: Number(e.target.value)})} />
                </label>
              </div>
              <div className="p-6 bg-gray-50 border-t flex gap-3">
                <button type="button" onClick={() => { setIsAdding(false); setIsEditing(null); }} className="flex-1 py-3 text-sm font-bold text-gray-400 hover:bg-gray-100 rounded-xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-[#ee2b6c] text-white text-sm font-bold rounded-xl shadow-lg hover:bg-[#d41b55] transition-all">
                  {isEditing ? 'Atualizar Produto' : 'Salvar no Estoque'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input 
              className="w-full pl-10 pr-4 h-11 bg-gray-50 border-gray-200 rounded-lg text-sm focus:ring-[#ee2b6c]/30" 
              placeholder="Pesquisar por nome ou modelo..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-[#4a1d35] uppercase tracking-wider">Produto / Modelo</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4a1d35] uppercase tracking-wider">Tam.</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4a1d35] uppercase tracking-wider">Cat.</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4a1d35] uppercase tracking-wider text-right">Custo</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4a1d35] uppercase tracking-wider text-right">Venda</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#4a1d35] uppercase tracking-wider text-center">Estoque</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.model || '-'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-600">{p.size || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold bg-purple-50 text-[#4a1d96] px-2 py-1 rounded-md uppercase">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-gray-500">{formatCurrency(p.cost_price)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-right text-[#4a1d96]">{formatCurrency(p.sale_price)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.stock <= 2 ? 'bg-red-100 text-red-600' : 
                        p.stock <= 5 ? 'bg-amber-100 text-amber-600' : 
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.stock} un
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-2">
                        <button 
                          onClick={() => startEdit(p)}
                          className="flex items-center gap-1 text-gray-500 hover:text-[#4a1d96] transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                          <span className="text-[10px] font-bold uppercase hidden sm:inline">Editar</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id, p.name)}
                          className="flex items-center gap-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                          <span className="text-[10px] font-bold uppercase hidden sm:inline">Apagar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400 text-sm italic">Nenhum produto encontrado.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock;
