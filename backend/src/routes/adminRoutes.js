import { Router } from "express";
import {
  dashboard,
  users,
  orders,
  products,
  markets,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";
const router = Router();
router.use(protect, authorize("admin"));
router.get("/dashboard", dashboard);
router.get("/users", users);
router.get("/orders", orders);
router.post("/products", products);
router.post("/markets", markets);
export default router;
