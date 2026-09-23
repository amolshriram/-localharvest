import mongoose from 'mongoose';
const ref = (model) => ({ type: mongoose.Schema.Types.ObjectId, ref: model });
export const Category = mongoose.model('Category', new mongoose.Schema({ name: { type: String, unique: true }, description: String }));
export const Address = mongoose.model('Address', new mongoose.Schema({ userId: ref('User'), label: String, address: String, phone: String, latitude: Number, longitude: Number }));
export const Payment = mongoose.model('Payment', new mongoose.Schema({ orderId: ref('Order'), method: String, status: { type: String, default: 'PENDING' }, amount: Number, transactionId: String }));
export const Notification = mongoose.model('Notification', new mongoose.Schema({ userId: ref('User'), title: String, message: String, read: { type: Boolean, default: false } }, { timestamps: true }));
export const Review = mongoose.model('Review', new mongoose.Schema({ orderId: ref('Order'), customerId: ref('User'), productRating: Number, deliveryRating: Number, overallRating: Number, comment: String }, { timestamps: true }));
