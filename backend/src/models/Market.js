import mongoose from 'mongoose';
const schema = new mongoose.Schema({ name: { type: String, required: true }, description: String, address: String, city: String, latitude: Number, longitude: Number, contactNumber: String, openingTime: String, closingTime: String, active: { type: Boolean, default: true, index: true } }, { timestamps: true });
export default mongoose.model('Market', schema);
