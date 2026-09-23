import mongoose from 'mongoose';
const schema = new mongoose.Schema({ orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', unique: true }, partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, status: { type: String, enum: ['ASSIGNED','ACCEPTED','ARRIVED_AT_PACKING_POINT','PICKED_UP','OUT_FOR_DELIVERY','DELIVERED'], default: 'ASSIGNED' }, acceptedAt: Date, pickedUpAt: Date, deliveredAt: Date }, { timestamps: true });
export default mongoose.model('Delivery', schema);
