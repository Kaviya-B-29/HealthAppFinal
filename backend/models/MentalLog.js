import mongoose from "mongoose";

const mentalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  mood: String,
  note: String,
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const MentalLog = mongoose.model("MentalLog", mentalSchema);
export default MentalLog;
