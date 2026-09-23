import api from "./api";
export const getDashboard = () => api.get("/admin/dashboard");
export const getAdminOrders = () => api.get("/admin/orders");
export const getUsers = () => api.get("/admin/users");
