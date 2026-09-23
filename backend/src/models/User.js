import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true }, email: { type: String, required: true, unique: true, lowercase: true, index: true }, phone: String,
  password: { type: String, required: true, select: false }, role: { type: String, enum: ['customer','admin','market_buyer','packing_staff','delivery_partner'], default: 'customer', index: true },
  address: String, latitude: Number, longitude: Number, active: { type: Boolean, default: true }
}, { timestamps: true });
userSchema.pre('save', async function(next) { if (!this.isModified('password')) return next(); this.password = await bcrypt.hash(this.password, 12); next(); });
userSchema.methods.comparePassword = function(value) { return bcrypt.compare(value, this.password); };
export default mongoose.model('User', userSchema);
