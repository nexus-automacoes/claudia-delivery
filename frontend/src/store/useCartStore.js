import { create } from 'zustand';

const loadCart = () => {
  try {
    const data = localStorage.getItem('cart');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  localStorage.setItem('cart', JSON.stringify(items));
};

const useCartStore = create((set, get) => ({
  items: loadCart(),
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

  addItem: (product) => {
    const items = get().items;
    const existing = items.find((i) => i.product.id === product.id);
    let next;
    if (existing) {
      next = items.map((i) =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      next = [...items, { product, quantity: 1 }];
    }
    saveCart(next);
    set({ items: next, isOpen: true });
  },

  removeItem: (productId) => {
    const next = get().items.filter((i) => i.product.id !== productId);
    saveCart(next);
    set({ items: next });
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const next = get().items.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    saveCart(next);
    set({ items: next });
  },

  clearCart: () => {
    saveCart([]);
    set({ items: [] });
  },

  getTotal: () =>
    get().items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),

  getItemCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),

  getItemQuantity: (productId) => {
    const item = get().items.find((i) => i.product.id === productId);
    return item ? item.quantity : 0;
  },
}));

export default useCartStore;
