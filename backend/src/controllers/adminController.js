import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Market from "../models/Market.js";
export async function dashboard(req, res, next) {
  try {
    const [orders, customers, partners, markets, revenue] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "delivery_partner", active: true }),
      Market.countDocuments({ active: true }),
      Order.aggregate([
        { $match: { status: "DELIVERED" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);
    res.json({
      success: true,
      stats: {
        orders,
        customers,
        partners,
        markets,
        revenue: revenue[0]?.total || 0,
        pending: await Order.countDocuments({
          status: { $nin: ["DELIVERED", "CANCELLED"] },
        }),
      },
    });
  } catch (e) {
    next(e);
  }
}
export async function users(req, res, next) {
  try {
    res.json({
      success: true,
      users: await User.find().select("-password").sort({ createdAt: -1 }),
    });
  } catch (e) {
    next(e);
  }
}
export async function orders(req, res, next) {
  try {
    res.json({
      success: true,
      orders: await Order.find()
        .populate("customerId marketId")
        .sort({ createdAt: -1 }),
    });
  } catch (e) {
    next(e);
  }
}
export async function products(req, res, next) {
  try {
    res
      .status(201)
      .json({ success: true, product: await Product.create(req.body) });
  } catch (e) {
    next(e);
  }
}
export async function markets(req, res, next) {
  try {
    res
      .status(201)
      .json({ success: true, market: await Market.create(req.body) });
  } catch (e) {
    next(e);
  }
}
