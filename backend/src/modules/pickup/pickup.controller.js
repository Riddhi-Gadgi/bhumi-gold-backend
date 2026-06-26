const service = require("./pickup.service");

exports.createPickup = async (req, res) => {
  try {
    const { order_id, slot_id } = req.body;
    const pickup = await service.createPickup(order_id, slot_id);
    res.status(201).json(pickup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPickup = async (req, res) => {
  try {
    const pickup = await service.getPickupById(req.params.id);
    if (!pickup) return res.status(404).json({ message: "Pickup not found" });
    res.json(pickup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPickupByOrder = async (req, res) => {
  try {
    const pickup = await service.getPickupByOrder(req.params.order_id);
    if (!pickup)
      return res.status(404).json({ message: "No pickup for this order" });
    res.json(pickup);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPickups = async (req, res) => {
  try {
    const pickups = await service.getAllPickups();
    res.json(pickups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const pickup = await service.updatePickupStatus(req.params.id, status);
    res.json(pickup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.reschedule = async (req, res) => {
  try {
    const { new_slot_id } = req.body;
    const pickup = await service.reschedulePickup(req.params.id, new_slot_id);
    res.json(pickup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.confirmPickup = async (req, res) => {
  try {
    const pickup = await service.confirmPickup(req.params.id);
    res.json(pickup);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
