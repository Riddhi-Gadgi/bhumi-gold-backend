const service = require("./pickupSlot.service");

exports.createSlot = async (req, res) => {
  try {
    const slot = await service.createSlot(req.body);
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllSlots = async (req, res) => {
  try {
    const slots = await service.getAllSlots();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const slots = await service.getAvailableSlots();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSlotById = async (req, res) => {
  try {
    const slot = await service.getSlotById(req.params.id);
    if (!slot) return res.status(404).json({ message: "Slot not found" });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSlot = async (req, res) => {
  try {
    const updated = await service.updateSlot(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.toggleSlotStatus = async (req, res) => {
  try {
    const slot = await service.toggleSlotStatus(req.params.id);
    res.json(slot);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.deleteSlot = async (req, res) => {
  try {
    const result = await service.deleteSlot(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
