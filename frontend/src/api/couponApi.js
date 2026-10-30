import axiosClient from './axiosClient';

export const couponApi = {
  getActiveCoupons: () => axiosClient.get('/coupons/active'),
  verifyCoupon: (code, cartTotal) => axiosClient.post('/coupons/verify', { code, cartTotal }),
};
