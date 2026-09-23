import { Router } from "express";
import { body } from "express-validator";
import { login, me, register } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
const router = Router();
router.post(
  "/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 8 }),
  ],
  register,
);
router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  login,
);
router.get("/me", protect, me);
export default router;
