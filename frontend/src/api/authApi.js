import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  getMe: () => axiosClient.get('/auth/me'),
  addAddress: (address) => axiosClient.post('/auth/addresses', address),
  getAddresses: () => axiosClient.get('/auth/addresses'),
};
