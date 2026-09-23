import User from '../models/User.js';
import PackingPoint from '../models/PackingPoint.js';
import { findNearestMarket } from './locationService.js';
import Order from '../models/Order.js';

export async function createOrder({ customerId, items, address, phone, latitude, longitude, paymentMethod = 'COD' }) {
  const market = await findNearestMarket(latitude, longitude);
  const buyer = await User.findOne({ role: 'market_buyer', active: true });
  if (!buyer) throw Object.assign(new Error('No market buyer is available'), { statusCode: 409 });
  const packingPoint = await PackingPoint.findOne({ marketId: market._id, active: true });
  if (!packingPoint) throw Object.assign(new Error('No packing point is available for this market'), { statusCode: 409 });
  const estimatedSubtotal = items.reduce((sum, item) => sum + item.quantity * item.estimatedPrice, 0);
  const deliveryFee = estimatedSubtotal >= 500 ? 0 : 30;
  const order = await Order.create({ customerId, items, address, phone, latitude, longitude, marketId: market._id, buyerId: buyer._id, packingPointId: packingPoint._id, paymentMethod, estimatedSubtotal, actualSubtotal: estimatedSubtotal, deliveryFee, total: estimatedSubtotal + deliveryFee, status: 'BUYER_ASSIGNED', statusHistory: [{ status: 'ORDER_PLACED', updatedBy: customerId, note: 'Order placed' }, { status: 'MARKET_ASSIGNED', updatedBy: customerId, note: `Nearest market: ${market.name}` }, { status: 'BUYER_ASSIGNED', updatedBy: customerId, note: 'Market buyer assigned' }] });
  return order.populate(['marketId','buyerId','packingPointId']);
}
export async function transitionOrder(order, status, userId, note) { const allowed = { BUYER_ASSIGNED: ['SHOPPING_IN_PROGRESS','CANCELLED'], SHOPPING_IN_PROGRESS: ['ITEMS_PURCHASED'], ITEMS_PURCHASED: ['AT_PACKING_POINT'], AT_PACKING_POINT: ['PACKING'], PACKING: ['READY_FOR_PICKUP'], READY_FOR_PICKUP: ['DELIVERY_ASSIGNED'], DELIVERY_ASSIGNED: ['PICKED_UP'], PICKED_UP: ['OUT_FOR_DELIVERY'], OUT_FOR_DELIVERY: ['DELIVERED'] }; if (!allowed[order.status]?.includes(status)) throw Object.assign(new Error(`Cannot move order from ${order.status} to ${status}`), { statusCode: 400 }); order.status = status; order.statusHistory.push({ status, updatedBy: userId, note }); return order.save(); }
