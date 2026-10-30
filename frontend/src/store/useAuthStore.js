import { create } from 'zustand';
import { authApi } from '../api/authApi';

const storedAuth = (() => {
  try {
    const raw = localStorage.getItem('freshmart_auth');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create((set, get) => ({
  user: storedAuth?.user || null,
  token: storedAuth?.token || null,
  isAuthenticated: !!storedAuth?.token,
  role: storedAuth?.role || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.login({ email, password });
      const { token, id, name, role, phone, addresses } = res.data;
      const userData = { id, name, email, role, phone, addresses: addresses || [] };

      localStorage.setItem('freshmart_auth', JSON.stringify({ token, user: userData, role }));
      set({ user: userData, token, role, isAuthenticated: true, loading: false });
      return { success: true, role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await authApi.register(userData);
      const { token, id, name, email, role, phone, addresses } = res.data;
      const user = { id, name, email, role, phone, addresses: addresses || [] };

      localStorage.setItem('freshmart_auth', JSON.stringify({ token, user, role }));
      set({ user, token, role, isAuthenticated: true, loading: false });
      return { success: true, role };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('freshmart_auth');
    set({ user: null, token: null, role: null, isAuthenticated: false });
  },

  addAddress: async (address) => {
    try {
      const res = await authApi.addAddress(address);
      const updatedAddresses = res.data;
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser = { ...currentUser, addresses: updatedAddresses };
        localStorage.setItem(
          'freshmart_auth',
          JSON.stringify({ token: get().token, user: updatedUser, role: get().role })
        );
        set({ user: updatedUser });
      }
      return { success: true, addresses: updatedAddresses };
    } catch (err) {
      return { success: false, message: err.message };
    }
  },

  refreshProfile: async () => {
    if (!get().token) return;
    try {
      const res = await authApi.getMe();
      const updatedUser = res.data;
      set({ user: updatedUser, role: updatedUser.role });
      localStorage.setItem(
        'freshmart_auth',
        JSON.stringify({ token: get().token, user: updatedUser, role: updatedUser.role })
      );
    } catch (err) {
      console.warn('Failed to refresh user profile', err);
    }
  },
}));
