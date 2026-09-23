import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    name: String,
    address: String,
    city: String,
    latitude: Number,
    longitude: Number,
    marketId: { type: mongoose.Schema.Types.ObjectId, ref: "Market" },
    contactNumber: String,
    active: { type: Boolean, default: true },
    capacity: { type: Number, default: 20 },
  },
  { timestamps: true },
);
export default mongoose.model("PackingPoint", schema);
