import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Market from "../models/Market.js";
import PackingPoint from "../models/PackingPoint.js";
await mongoose.connect(process.env.MONGO_URI);
await Promise.all([
  User.deleteMany({}),
  Product.deleteMany({}),
  Market.deleteMany({}),
  PackingPoint.deleteMany({}),
]);
const users = await User.create([
  {
    name: "Demo Admin",
    email: "admin@localharvest.demo",
    password: "Password123!",
    role: "admin",
  },
  {
    name: "Market Buyer",
    email: "buyer@localharvest.demo",
    password: "Password123!",
    role: "market_buyer",
  },
  {
    name: "Packing Staff",
    email: "packing@localharvest.demo",
    password: "Password123!",
    role: "packing_staff",
  },
  {
    name: "Delivery Partner",
    email: "delivery@localharvest.demo",
    password: "Password123!",
    role: "delivery_partner",
  },
]);
const markets = await Market.create([
  {
    name: "Green Basket Market",
    description: "Fresh produce from the morning wholesale lane",
    address: "12 Jubilee Hills Road",
    city: "Hyderabad",
    latitude: 17.4239,
    longitude: 78.4738,
    active: true,
  },
  {
    name: "Sunrise Farmers Market",
    description: "Local growers and seasonal fruit",
    address: "8 Banjara Hills",
    city: "Hyderabad",
    latitude: 17.4126,
    longitude: 78.4482,
    active: true,
  },
  {
    name: "Harvest Square",
    description: "Everyday essentials, sourced nearby",
    address: "44 Madhapur Main Road",
    city: "Hyderabad",
    latitude: 17.4483,
    longitude: 78.3915,
    active: true,
  },
]);
await PackingPoint.create(
  markets.map((market, index) => ({
    name: `${market.name} packing point`,
    address: market.address,
    city: market.city,
    marketId: market._id,
    latitude: market.latitude,
    longitude: market.longitude,
    capacity: 25 - index * 4,
    active: true,
  })),
);
await Product.create(
  [
    ["Tomatoes", "Vegetables", "kg", 42, "🍅"],
    ["Potatoes", "Vegetables", "kg", 34, "🥔"],
    ["Red onions", "Vegetables", "kg", 38, "🧅"],
    ["Baby spinach", "Vegetables", "bundle", 28, "🥬"],
    ["Carrots", "Vegetables", "kg", 46, "🥕"],
    ["Apples", "Fruits", "kg", 160, "🍎"],
    ["Bananas", "Fruits", "dozen", 68, "🍌"],
    ["Mangoes", "Fruits", "kg", 125, "🥭"],
    ["Oranges", "Fruits", "kg", 95, "🍊"],
    ["Grapes", "Fruits", "kg", 110, "🍇"],
  ].map(([name, category, unit, estimatedPrice, emoji]) => ({
    name,
    category,
    unit,
    estimatedPrice,
    emoji,
    description: `Fresh ${name.toLowerCase()} sourced from a nearby market.`,
  })),
);
console.log(
  `Seeded ${users.length} staff, ${markets.length} markets, and 10 products`,
);
await mongoose.disconnect();
