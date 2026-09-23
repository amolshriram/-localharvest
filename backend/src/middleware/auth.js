import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
  try {
    const token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (!token)
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select("-password");
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: "User no longer exists" });
    next();
  } catch {
    res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}
export function authorize(...roles) {
  return (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : res
          .status(403)
          .json({
            success: false,
            message: "You do not have access to this resource",
          });
}
