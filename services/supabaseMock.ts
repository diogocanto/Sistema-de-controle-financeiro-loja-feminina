
import { Customer, Product, Sale, SaleItem, Installment, Expense, PaymentMethod } from '../types';

const STORAGE_KEYS = {
  CUSTOMERS: 'bf_customers',
  PRODUCTS: 'bf_products',
  SALES: 'bf_sales',
  SALE_ITEMS: 'bf_sale_items',
  INSTALLMENTS: 'bf_installments',
  EXPENSES: 'bf_expenses'
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  try {
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const setToStorage = <T,>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initial Data
const initialProducts: Product[] = [
  { id: '1', name: 'Blusa Gola V', model: 'Básica', size: 'M', category: 'Blusas', cost_price: 25.00, sale_price: 49.90, stock: 10 },
  { id: '2', name: 'Calça Jeans Skinny', model: 'Levanta Bumbum', size: '38', category: 'Calças', cost_price: 45.00, sale_price: 89.90, stock: 12 },
  { id: '3', name: 'Cinto Couro', model: 'Fivela Dourada', size: 'Único', category: 'Acessórios', cost_price: 12.00, sale_price: 29.90, stock: 8 }
];

export const db = {
  getCustomers: () => getFromStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, []),
  addCustomer: (customer: Omit<Customer, 'id' | 'created_at' | 'total_bought' | 'total_paid'>) => {
    const customers = db.getCustomers();
    const newCustomer: Customer = {
      ...customer,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      total_bought: 0,
      total_paid: 0
    };
    setToStorage(STORAGE_KEYS.CUSTOMERS, [...customers, newCustomer]);
    return newCustomer;
  },

  getProducts: () => getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts),
  addProduct: (product: Omit<Product, 'id'>) => {
    const products = db.getProducts();
    const newProduct: Product = { ...product, id: crypto.randomUUID() };
    setToStorage(STORAGE_KEYS.PRODUCTS, [...products, newProduct]);
    return newProduct;
  },
  deleteProduct: (id: string) => {
    const products = db.getProducts();
    setToStorage(STORAGE_KEYS.PRODUCTS, products.filter(p => p.id !== id));
  },
  updateProductStock: (id: string, diff: number) => {
    const products = db.getProducts();
    const updated = products.map(p => p.id === id ? { ...p, stock: p.stock + diff } : p);
    setToStorage(STORAGE_KEYS.PRODUCTS, updated);
  },

  getSales: () => getFromStorage<Sale[]>(STORAGE_KEYS.SALES, []),
  createSale: (saleData: Omit<Sale, 'id' | 'date'>, items: { productId: string, quantity: number, price: number }[]) => {
    const currentSales = db.getSales();
    const saleId = crypto.randomUUID();
    const newSale: Sale = { ...saleData, id: saleId, date: new Date().toISOString() };

    const currentAllItems = getFromStorage<SaleItem[]>(STORAGE_KEYS.SALE_ITEMS, []);
    const newItems: SaleItem[] = items.map(item => ({
      id: crypto.randomUUID(),
      sale_id: saleId,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.price
    }));
    setToStorage(STORAGE_KEYS.SALE_ITEMS, [...currentAllItems, ...newItems]);

    if (saleData.payment_method === PaymentMethod.INSTALLMENT && saleData.customer_id) {
      const currentInstallments = getFromStorage<Installment[]>(STORAGE_KEYS.INSTALLMENTS, []);
      const count = saleData.installments_count || 1;
      const installmentValue = saleData.total_value / count;
      const newInstallments: Installment[] = Array.from({ length: count }).map((_, i) => {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        return {
          id: crypto.randomUUID(),
          sale_id: saleId,
          customer_id: saleData.customer_id!,
          number: i + 1,
          value: installmentValue,
          due_date: dueDate.toISOString(),
          status: 'pending'
        };
      });
      setToStorage(STORAGE_KEYS.INSTALLMENTS, [...currentInstallments, ...newInstallments]);
    }

    items.forEach(item => db.updateProductStock(item.productId, -item.quantity));

    if (saleData.customer_id) {
      const customers = db.getCustomers();
      const updatedCustomers = customers.map(c => 
        c.id === saleData.customer_id ? { ...c, total_bought: Number(c.total_bought || 0) + Number(saleData.total_value) } : c
      );
      setToStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
    }

    setToStorage(STORAGE_KEYS.SALES, [...currentSales, newSale]);
    return newSale;
  },

  getExpenses: () => getFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []),
  addExpense: (expense: Omit<Expense, 'id'>) => {
    const expenses = db.getExpenses();
    const newExpense: Expense = { ...expense, id: crypto.randomUUID() };
    setToStorage(STORAGE_KEYS.EXPENSES, [...expenses, newExpense]);
    return newExpense;
  },

  getInstallments: () => {
    const insts = getFromStorage<Installment[]>(STORAGE_KEYS.INSTALLMENTS, []);
    const now = new Date();
    return insts.map(inst => {
      const isOverdue = inst.status === 'pending' && new Date(inst.due_date) < now;
      return isOverdue ? { ...inst, status: 'overdue' as const } : inst;
    });
  },

  payInstallment: (id: string, value: number) => {
    const installments = db.getInstallments();
    const inst = installments.find(i => i.id === id);
    if (!inst) return;
    const updated = installments.map(i => i.id === id ? { ...i, status: 'paid' as const } : i);
    setToStorage(STORAGE_KEYS.INSTALLMENTS, updated);
    const customers = db.getCustomers();
    const updatedCustomers = customers.map(c => 
      c.id === inst.customer_id ? { ...c, total_paid: Number(c.total_paid || 0) + Number(value) } : c
    );
    setToStorage(STORAGE_KEYS.CUSTOMERS, updatedCustomers);
  }
};
