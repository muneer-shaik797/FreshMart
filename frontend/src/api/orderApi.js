import axiosClient from './axiosClient';

export const orderApi = {
  createOrder: (orderData) => axiosClient.post('/orders', orderData),
  getOrderById: (id) => axiosClient.get(`/orders/${id}`),
  getOrderByNumber: (orderNumber) => axiosClient.get(`/orders/number/${orderNumber}`),
  getMyOrders: () => axiosClient.get('/orders/user/me'),
  cancelOrder: (id, reason) => axiosClient.post(`/orders/${id}/cancel`, { reason }),
  simulateDriver: (id) => axiosClient.post(`/orders/${id}/simulate-driver`),

  // Admin
  getAllOrdersAdmin: () => axiosClient.get('/orders/admin/all'),
  updateOrderStatus: (id, statusData) => axiosClient.patch(`/orders/admin/${id}/status`, statusData),
  getDashboardStats: () => axiosClient.get('/admin/dashboard-stats'),
};
