import bcrypt from "bcryptjs";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: "Please fill all fields" });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  const user = await User.create({ name, email, password: hashed });
  const token = generateToken(user._id);

  res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email } });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = generateToken(user._id);
  res.json({ token, user: { _id: user._id, name: user.name, email: user.email } });
};

export const getMe = async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Not authorized" });
  res.json(req.user);
};
