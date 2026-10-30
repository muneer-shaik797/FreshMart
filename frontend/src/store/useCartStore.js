import { create } from 'zustand';

const storedCart = (() => {
  try {
    const raw = localStorage.getItem('freshmart_cart');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

export const useCartStore = create((set, get) => ({
  items: storedCart?.items || [],
  isCartOpen: false,
  appliedCoupon: storedCart?.appliedCoupon || null,
  deliverySlot: storedCart?.deliverySlot || {
    slotId: 'express_45m',
    title: 'Express Delivery (Under 45 Mins)',
    type: 'EXPRESS',
    extraFee: 25.0,
    date: 'Today',
  },
  deliveryAddress: storedCart?.deliveryAddress || null,
  deliveryNotes: '',

  setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

  addItem: (product, quantity = 1) => {
    const currentItems = [...get().items];
    const existingIndex = currentItems.findIndex((i) => i.productId === product.id);

    if (existingIndex > -1) {
      const existing = currentItems[existingIndex];
      const newQty = existing.quantity + quantity;
      currentItems[existingIndex] = {
        ...existing,
        quantity: newQty,
        total: Math.round(newQty * existing.price * 100) / 100,
      };
    } else {
      currentItems.push({
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        unit: product.unit,
        price: product.price,
        quantity,
        total: Math.round(quantity * product.price * 100) / 100,
      });
    }

    set({ items: currentItems });
    get().persist();
  },

  updateQty: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const currentItems = get().items.map((i) =>
      i.productId === productId
        ? { ...i, quantity, total: Math.round(quantity * i.price * 100) / 100 }
        : i
    );
    set({ items: currentItems });
    get().persist();
  },

  removeItem: (productId) => {
    const currentItems = get().items.filter((i) => i.productId !== productId);
    set({ items: currentItems });
    get().persist();
  },

  clearCart: () => {
    set({ items: [], appliedCoupon: null });
    get().persist();
  },

  setAppliedCoupon: (coupon) => {
    set({ appliedCoupon: coupon });
    get().persist();
  },

  removeCoupon: () => {
    set({ appliedCoupon: null });
    get().persist();
  },

  setDeliverySlot: (slot) => {
    set({ deliverySlot: slot });
    get().persist();
  },

  setDeliveryAddress: (address) => {
    set({ deliveryAddress: address });
    get().persist();
  },

  setDeliveryNotes: (notes) => {
    set({ deliveryNotes: notes });
  },

  // Computed totals
  getSubtotal: () => {
    const items = get().items;
    return Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
  },

  getDiscount: () => {
    const coupon = get().appliedCoupon;
    if (!coupon) return 0;
    return coupon.discountAmount || 0;
  },

  getDeliveryFee: () => {
    const subtotal = get().getSubtotal();
    const slot = get().deliverySlot;
    const baseFee = subtotal >= 499 ? 0 : 40.0;
    const slotExtra = slot?.extraFee || 0;
    return baseFee + slotExtra;
  },

  getTax: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    const taxable = Math.max(0, subtotal - discount);
    return Math.round(taxable * 0.05 * 100) / 100; // 5% GST
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscount();
    const delivery = get().getDeliveryFee();
    const tax = get().getTax();
    return Math.round(Math.max(0, subtotal - discount + delivery + tax) * 100) / 100;
  },

  getItemCount: () => {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },

  persist: () => {
    const state = get();
    localStorage.setItem(
      'freshmart_cart',
      JSON.stringify({
        items: state.items,
        appliedCoupon: state.appliedCoupon,
        deliverySlot: state.deliverySlot,
        deliveryAddress: state.deliveryAddress,
      })
    );
  },
}));
