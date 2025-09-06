import MentalLog from "../models/MentalLog.js";

// Add Mental Log
export const addMentalLog = async (req, res) => {
  try {
    const { mood } = req.body;
    if (!mood)
      return res.status(400).json({ message: "Mood is required" });

    const log = await MentalLog.create({ ...req.body, user: req.user.id });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get Mental Logs
export const getMentalLogs = async (req, res) => {
  try {
    const logs = await MentalLog.find({ user: req.user.id });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Mental Log
export const deleteMentalLog = async (req, res) => {
  try {
    const log = await MentalLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found" });

    if (log.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await log.deleteOne();
    res.json({ message: "Log deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
