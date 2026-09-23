import api from './api';
export const createOrder = data => api.post('/orders',data);
export const getOrders = () => api.get('/orders');
export const getOrder = id => api.get(`/orders/${id}`);
export const updateStatus = (id,data) => api.patch(`/orders/${id}/status`,data);
export const recordPurchase = (id,data) => api.post(`/orders/${id}/purchase`,data);
