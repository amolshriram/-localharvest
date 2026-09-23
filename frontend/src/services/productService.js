import api from './api';
export const getProducts = params => api.get('/products',{params});
