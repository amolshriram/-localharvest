import Order from "../models/Order.js";
import Product from "../models/Product.js";
import PurchaseRecord from "../models/PurchaseRecord.js";
import { createOrder, transitionOrder } from "../services/orderService.js";
export async function create(req, res, next) {
  try {
    const productIds = req.body.items.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      available: true,
    });
    if (products.length !== productIds.length)
      return res
        .status(400)
        .json({
          success: false,
          message: "One or more products are unavailable",
        });
    const items = products.map((product) => {
      const input = req.body.items.find(
        (item) => String(item.productId) === String(product._id),
      );
      return {
        productId: product._id,
        name: product.name,
        unit: product.unit,
        quantity: input.quantity,
        estimatedPrice: product.estimatedPrice,
      };
    });
    const order = await createOrder({
      ...req.body,
      customerId: req.user._id,
      items,
    });
    res.status(201).json({ success: true, order });
  } catch (e) {
    next(e);
  }
}
export async function mine(req, res, next) {
  try {
    const filter =
      req.user.role === "customer"
        ? { customerId: req.user._id }
        : req.user.role === "market_buyer"
          ? { buyerId: req.user._id }
          : req.user.role === "packing_staff"
            ? {
                status: {
                  $in: ["AT_PACKING_POINT", "PACKING", "READY_FOR_PICKUP"],
                },
              }
            : req.user.role === "delivery_partner"
              ? { deliveryPartnerId: req.user._id }
              : {};
    res.json({
      success: true,
      orders: await Order.find(filter)
        .populate(
          "customerId marketId buyerId packingPointId deliveryPartnerId",
        )
        .sort({ createdAt: -1 }),
    });
  } catch (e) {
    next(e);
  }
}
export async function get(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate(
      "customerId marketId buyerId packingPointId deliveryPartnerId",
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    if (
      req.user.role === "customer" &&
      String(order.customerId._id) !== String(req.user._id)
    )
      return res
        .status(403)
        .json({ success: false, message: "Not your order" });
    res.json({ success: true, order });
  } catch (e) {
    next(e);
  }
}
export async function status(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    const updated = await transitionOrder(
      order,
      req.body.status,
      req.user._id,
      req.body.note,
    );
    res.json({ success: true, order: updated });
  } catch (e) {
    next(e);
  }
}
export async function purchase(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order || String(order.buyerId) !== String(req.user._id))
      return res
        .status(404)
        .json({ success: false, message: "Assigned order not found" });
    for (const record of req.body.records) {
      await PurchaseRecord.create({
        ...record,
        orderId: order._id,
        buyerId: req.user._id,
        marketId: order.marketId,
      });
      const item = order.items.find(
        (entry) => String(entry.productId) === String(record.productId),
      );
      if (item) {
        item.actualQuantity = record.purchasedQuantity;
        item.actualPrice = record.marketPrice;
        item.availability = record.availabilityStatus;
      }
    }
    order.actualSubtotal = order.items.reduce(
      (sum, item) =>
        sum +
        (item.actualQuantity || item.quantity) *
          (item.actualPrice || item.estimatedPrice),
      0,
    );
    order.total = order.actualSubtotal + order.deliveryFee;
    await transitionOrder(
      order,
      "ITEMS_PURCHASED",
      req.user._id,
      "Buyer recorded market purchases",
    );
    res.json({ success: true, order });
  } catch (e) {
    next(e);
  }
}
