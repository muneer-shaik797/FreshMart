import axiosClient from './axiosClient';

export const paymentApi = {
  createRazorpayOrder: (orderId) => axiosClient.post(`/payments/create-order/${orderId}`),
  verifyPayment: (payload) => axiosClient.post('/payments/verify', payload),
  recordFailure: (payload) => axiosClient.post('/payments/fail', payload),
  getCategories: () => axiosClient.get('/payments/categories'),
  getAllPayments: (params = {}) => axiosClient.get('/payments', { params }),
  getMyPayments: () => axiosClient.get('/payments/user/me'),
  getPaymentByOrderId: (orderId) => axiosClient.get(`/payments/order/${orderId}`),
};
