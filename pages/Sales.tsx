
import React, { useState, useMemo } from 'react';
import { db } from '../services/supabaseMock';
import { Product, PaymentMethod, Customer } from '../types';

interface CartItem {
  product: Product;
  quantity: number;
}

const Sales: React.FC = () => {
  const products = db.getProducts();
  const customers = db.getCustomers();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CARD);
  const [installments, setInstallments] = useState(1);
  const [searchProduct, setSearchProduct] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');

  const filteredProducts = useMemo(() => 
    products.filter(p => (p.name.toLowerCase().includes(searchProduct.toLowerCase()) || p.model.toLowerCase().includes(searchProduct.toLowerCase())) && p.stock > 0),
  [products, searchProduct]);

  const filteredCustomers = useMemo(() => 
    customers.filter(c => c.name.toLowerCase().includes(searchCustomer.toLowerCase())),
  [customers, searchCustomer]);

  const subtotal = cart.reduce((acc, item) => acc + (item.product.sale_price * item.quantity), 0);
  const total = subtotal;

  const addToCart = (p: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === p.id);
      if (existing) {
        if (existing.quantity >= p.stock) return prev;
        return prev.map(item => item.product.id === p.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product: p, quantity: 1 }];
    });
    setSearchProduct('');
  };

  const updateQuantity = (productId: string, diff: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(0, item.quantity + diff);
        if (newQty > item.product.stock) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(i => i.quantity > 0));
  };

  const handleFinishSale = () => {
    if (cart.length === 0) return alert('Carrinho vazio');
    if (paymentMethod === PaymentMethod.INSTALLMENT && !selectedCustomer) {
      return alert('Selecione um cliente para vendas em crediário');
    }

    db.createSale(
      { 
        customer_id: selectedCustomer?.id, 
        total_value: total, 
        payment_method: paymentMethod, 
        installments_count: paymentMethod === PaymentMethod.INSTALLMENT ? installments : undefined 
      },
      cart.map(i => ({ productId: i.product.id, quantity: i.quantity, price: i.product.sale_price }))
    );

    alert('Venda finalizada com sucesso!');
    setCart([]);
    setSelectedCustomer(null);
    setPaymentMethod(PaymentMethod.CARD);
  };

  const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden h-full">
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-y-auto px-4 py-6 lg:px-10 bg-[#f8f6f6]">
        <div className="max-w-[1000px] w-full mx-auto flex flex-col gap-6">
          <header>
            <h1 className="text-[#4a1d96] tracking-tight text-2xl lg:text-[32px] font-bold text-center lg:text-left">Registro de Venda</h1>
            <p className="text-[#89616f] text-xs lg:text-sm text-center lg:text-left">Nova Venda #{Math.floor(Math.random() * 100000)} • {new Date().toLocaleDateString('pt-BR')}</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <p className="text-[#4a1d96] text-sm font-bold pb-2">Cliente</p>
              <div className="relative group">
                <input 
                  className="w-full rounded-lg border-[#e6dbdf] h-12 pl-11 pr-4 focus:ring-[#ee2b6c]/20" 
                  placeholder="Buscar cliente..." 
                  value={selectedCustomer ? selectedCustomer.name : searchCustomer}
                  onChange={e => {
                    setSearchCustomer(e.target.value);
                    if (selectedCustomer) setSelectedCustomer(null);
                  }}
                />
                <span className="material-symbols-outlined absolute left-3 top-3 text-[#89616f]">person_search</span>
                {selectedCustomer && (
                  <button onClick={() => setSelectedCustomer(null)} className="absolute right-3 top-3 text-[#ee2b6c]">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                )}
                {!selectedCustomer && searchCustomer && (
                  <div className="absolute top-full left-0 w-full bg-white border border-[#e6dbdf] rounded-lg mt-1 z-30 shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                    {filteredCustomers.map(c => (
                      <button 
                        key={c.id} 
                        onClick={() => { setSelectedCustomer(c); setSearchCustomer(''); }}
                        className="w-full text-left px-4 py-3 hover:bg-pink-50 text-sm flex justify-between items-center"
                      >
                        <span className="font-bold">{c.name}</span>
                        <span className="text-xs text-[#89616f]">{c.phone}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <p className="text-[#4a1d96] text-sm font-bold pb-2">Adicionar Produto</p>
              <div className="relative">
                <input 
                  className="w-full rounded-lg border-[#e6dbdf] h-12 pl-11 pr-4 focus:ring-[#ee2b6c]/20" 
                  placeholder="Nome, modelo ou código..." 
                  value={searchProduct}
                  onChange={e => setSearchProduct(e.target.value)}
                />
                <span className="material-symbols-outlined absolute left-3 top-3 text-[#89616f]">qr_code_scanner</span>
                {searchProduct && (
                  <div className="absolute top-full left-0 w-full bg-white border border-[#e6dbdf] rounded-lg mt-1 z-30 shadow-xl overflow-hidden max-h-40 overflow-y-auto">
                    {filteredProducts.map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => addToCart(p)}
                        className="w-full text-left px-4 py-3 hover:bg-pink-50 text-sm flex justify-between"
                      >
                        <div>
                          <p className="font-bold">{p.name} <span className="text-[10px] text-gray-400 font-normal">({p.size})</span></p>
                          <p className="text-xs text-[#89616f]">{p.model} • Est: {p.stock}</p>
                        </div>
                        <span className="font-bold text-[#ee2b6c]">{formatCurrency(p.sale_price)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[#e6dbdf] bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="bg-[#fcfbfc] border-b border-[#e6dbdf]">
                    <th className="px-4 lg:px-6 py-4 text-[#4a1d96] text-xs font-bold uppercase w-[40%]">Produto</th>
                    <th className="px-4 lg:px-6 py-4 text-[#4a1d96] text-xs font-bold uppercase text-center">Qtd.</th>
                    <th className="px-4 lg:px-6 py-4 text-[#4a1d96] text-xs font-bold uppercase text-right">Subtotal</th>
                    <th className="px-4 lg:px-6 py-4 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6dbdf]">
                  {cart.map(item => (
                    <tr key={item.product.id} className="hover:bg-pink-50/20 transition-colors">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-[#181113] text-sm">{item.product.name} ({item.product.size})</span>
                          <span className="text-[#89616f] text-[10px] uppercase font-bold">Unit: {formatCurrency(item.product.sale_price)}</span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <div className="inline-flex items-center rounded-lg border border-[#e6dbdf] h-8 overflow-hidden">
                          <button onClick={() => updateQuantity(item.product.id, -1)} className="w-7 h-full hover:bg-gray-100 flex items-center justify-center text-[#4a1d96]"><span className="material-symbols-outlined text-sm">remove</span></button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, 1)} className="w-7 h-full hover:bg-gray-100 flex items-center justify-center text-[#4a1d96]"><span className="material-symbols-outlined text-sm">add</span></button>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-right font-bold text-[#4a1d96] text-sm">{formatCurrency(item.product.sale_price * item.quantity)}</td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <button onClick={() => updateQuantity(item.product.id, -item.quantity)} className="text-[#89616f] hover:text-red-500"><span className="material-symbols-outlined text-xl">delete</span></button>
                      </td>
                    </tr>
                  ))}
                  {cart.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400 text-sm">O carrinho está vazio. Comece adicionando produtos.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="bg-gray-50 border-t border-[#e6dbdf] px-6 py-3 flex justify-end gap-4 text-xs font-bold text-[#89616f]">
              <span>{cart.length} itens</span>
              <span>|</span>
              <span>{cart.reduce((a, b) => a + b.quantity, 0)} peças</span>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[420px] bg-white border-t lg:border-t-0 lg:border-l border-[#e6dbdf] flex flex-col lg:h-full shadow-lg z-10 shrink-0">
        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          <h3 className="text-[#4a1d96] text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">payments</span> Resumo Financeiro
          </h3>
          
          <div className="flex flex-col gap-3 p-4 bg-[#f8f6f6] rounded-xl border border-[#e6dbdf]">
            <div className="flex justify-between items-center text-sm">
              <span>Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Desconto</span>
              <input className="w-20 lg:w-24 text-right border-none bg-white rounded h-8 text-sm focus:ring-1 focus:ring-[#ee2b6c]" defaultValue="R$ 0,00" />
            </div>
            <div className="h-px bg-[#e6dbdf] my-1"></div>
            <div className="flex justify-between items-end text-[#4a1d96]">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-2xl lg:text-3xl tracking-tight">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-bold">Forma de Pagamento</h4>
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {[PaymentMethod.PIX, PaymentMethod.CASH, PaymentMethod.CARD, PaymentMethod.INSTALLMENT].map(m => {
                const isSelected = paymentMethod === m;
                let icon = 'payments';
                if (m === PaymentMethod.PIX) icon = 'photos';
                if (m === PaymentMethod.CARD) icon = 'credit_card';
                if (m === PaymentMethod.INSTALLMENT) icon = 'receipt_long';
                
                return (
                  <button 
                    key={m} 
                    onClick={() => setPaymentMethod(m)}
                    className={`relative flex flex-col items-center justify-center gap-1 lg:gap-2 p-2 lg:p-3 rounded-xl border-2 transition-all ${
                      isSelected ? 'border-[#ee2b6c] bg-pink-50/50' : 'border-[#e6dbdf] hover:border-[#ee2b6c]/50'
                    }`}
                  >
                    <span className={`material-symbols-outlined text-xl lg:text-2xl ${isSelected ? 'text-[#ee2b6c]' : 'text-[#4a1d96]'}`}>{icon}</span>
                    <span className={`text-xs lg:text-sm font-bold ${isSelected ? 'text-[#ee2b6c]' : 'text-gray-700'}`}>{m}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMethod === PaymentMethod.INSTALLMENT && (
            <div className="p-4 bg-pink-50 rounded-lg border border-[#ee2b6c]/20">
              <p className="text-[10px] font-bold text-[#ee2b6c] uppercase mb-2">Crediário</p>
              <div className="flex flex-col gap-2">
                <select 
                  className="rounded-lg border-[#e6dbdf] w-full text-xs" 
                  value={installments} 
                  onChange={e => setInstallments(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}x de {formatCurrency(total / n)}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 lg:p-6 border-t border-[#e6dbdf] bg-white sticky bottom-0">
          <button 
            onClick={handleFinishSale}
            className="flex w-full cursor-pointer items-center justify-center rounded-xl h-12 lg:h-14 bg-[#ee2b6c] hover:bg-[#d91e5b] text-white lg:text-lg font-bold shadow-lg transition-all gap-2"
          >
            <span className="material-symbols-outlined">check</span>
            <span>Finalizar Venda</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sales;
