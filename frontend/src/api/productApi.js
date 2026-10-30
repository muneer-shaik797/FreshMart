import axiosClient from './axiosClient';

export const productApi = {
  getProducts: (params = {}) => axiosClient.get('/products', { params }),
  getProductById: (id) => axiosClient.get(`/products/${id}`),
  getCategories: () => axiosClient.get('/products/categories'),
  getFeatured: () => axiosClient.get('/products/featured'),
  getTrending: () => axiosClient.get('/products/trending'),
  getRecommendations: (categories = []) => axiosClient.get('/products/recommendations', {
    params: { categories: categories.join(',') }
  }),
  getRelatedProducts: (id, category) => axiosClient.get(`/products/${id}/related`, {
    params: { category }
  }),

  // Admin Product Management
  adminAddProduct: (product) => axiosClient.post('/products/admin', product),
  adminUpdateProduct: (id, product) => axiosClient.put(`/products/admin/${id}`, product),
  adminUpdateStock: (id, stockQuantity) => axiosClient.patch(`/products/admin/${id}/stock`, { stockQuantity }),
  adminDeleteProduct: (id) => axiosClient.delete(`/products/admin/${id}`),
};
