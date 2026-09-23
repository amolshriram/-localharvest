import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    category: {
      type: String,
      enum: ["Fruits", "Vegetables"],
      required: true,
      index: true,
    },
    unit: {
      type: String,
      enum: ["kg", "gram", "piece", "dozen", "bundle"],
      default: "kg",
    },
    image: String,
    estimatedPrice: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true },
    emoji: String,
  },
  { timestamps: true },
);
export default mongoose.model("Product", schema);
