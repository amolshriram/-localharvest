import { Router } from "express";
import {
    dashboard,
    users,
    orders,
    products,
    markets,
    deliveryPartners,
    assignDeliveryPartner,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";
const router = Router();
router.use(protect, authorize("admin"));
router.get("/dashboard", dashboard);
router.get("/users", users);
router.get("/orders", orders);
router.post("/products", products);
router.post("/markets", markets);
router.get("/delivery-partners", deliveryPartners);
router.patch("/orders/:id/assign-delivery", assignDeliveryPartner);
export default router;
