import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const Food = mongoose.model("Food", foodSchema);
export default Food;
