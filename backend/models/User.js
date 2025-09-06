import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    age: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    preference: { type: String }, // weight_loss, muscle_gain, etc.
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;

