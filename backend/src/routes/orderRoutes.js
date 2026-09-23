import { Router } from "express";
import {
  create,
  get,
  mine,
  status,
  purchase,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/auth.js";
const router = Router();
router.use(protect);
router.post("/", authorize("customer"), create);
router.get("/", mine);
router.get("/:id", get);
router.patch(
  "/:id/status",
  authorize("admin", "market_buyer", "packing_staff", "delivery_partner"),
  status,
);
router.post("/:id/purchase", authorize("market_buyer"), purchase);
export default router;
