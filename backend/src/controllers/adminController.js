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

export async function deliveryPartners(req, res, next) {
  try {
    const partners = await User.find({
      role: "delivery_partner",
      active: true,
    })
      .select("_id name email phone")
      .sort({ name: 1 });

    res.json({
      success: true,
      partners,
    });
  } catch (e) {
    next(e);
  }
}

export async function assignDeliveryPartner(req, res, next) {
  try {
    const { deliveryPartnerId } = req.body;

    if (!deliveryPartnerId) {
      return res.status(400).json({
        success: false,
        message: "Delivery partner is required",
      });
    }

    const partner = await User.findOne({
      _id: deliveryPartnerId,
      role: "delivery_partner",
      active: true,
    });

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Active delivery partner not found",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status !== "READY_FOR_PICKUP") {
      return res.status(400).json({
        success: false,
        message:
          "Delivery partner can only be assigned when the order is ready for pickup",
      });
    }

    order.deliveryPartnerId = partner._id;
    order.status = "DELIVERY_ASSIGNED";

    order.statusHistory.push({
      status: "DELIVERY_ASSIGNED",
      updatedBy: req.user._id,
      note: `Delivery partner assigned: ${partner.name}`,
    });

    await order.save();

    await order.populate([
      "customerId",
      "marketId",
      "buyerId",
      "packingPointId",
      "deliveryPartnerId",
    ]);

    res.json({
      success: true,
      message: "Delivery partner assigned successfully",
      order,
    });
  } catch (e) {
    next(e);
  }
}
