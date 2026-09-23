import api from "./api";

export const getDashboard = () => api.get("/admin/dashboard");

export const getAdminOrders = () => api.get("/admin/orders");

export const getUsers = () => api.get("/admin/users");

export const getDeliveryPartners = () =>
  api.get("/admin/delivery-partners");

export const assignDeliveryPartner = (orderId, deliveryPartnerId) =>
  api.patch(`/admin/orders/${orderId}/assign-delivery`, {
    deliveryPartnerId,
  });