import Food from "../models/Food.js";

// Add Food
export const addFood = async (req, res) => {
  try {
    const { name, calories } = req.body;
    if (!name || !calories)
      return res.status(400).json({ message: "Name and calories required" });

    const food = await Food.create({ ...req.body, user: req.user.id });
    res.status(201).json(food);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Foods
export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find({ user: req.user.id });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Food
export const deleteFood = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    if (food.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await food.deleteOne();
    res.json({ message: "Food deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
