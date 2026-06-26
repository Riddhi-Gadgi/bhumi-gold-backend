const PickupSlot = require("./pickupSlot.model");

exports.createSlot = async (data) => {
  return await PickupSlot.create(data);
};

exports.getAllSlots = async (filter = {}) => {
  return await PickupSlot.find(filter)
    .sort({ slot_date: 1, start_time: 1 })
    .lean();
};

exports.getAvailableSlots = async () => {
  const now = new Date();
  return await PickupSlot.find({
    slot_date: { $gte: now },
    is_active: true,
    $expr: { $lt: ["$booked_count", "$max_capacity"] },
  })
    .sort({ slot_date: 1, start_time: 1 })
    .lean();
};

exports.getSlotById = async (id) => {
  return await PickupSlot.findById(id).lean();
};

exports.updateSlot = async (id, data) => {
  return await PickupSlot.findByIdAndUpdate(id, data, { new: true }).lean();
};

exports.toggleSlotStatus = async (id) => {
  const slot = await PickupSlot.findById(id);
  if (!slot) throw new Error("Slot not found");
  slot.is_active = !slot.is_active;
  await slot.save();
  return slot;
};

exports.deleteSlot = async (id) => {
  // Check if any pickup uses this slot
  const Pickup = require("../pickup/pickup.model");
  const count = await Pickup.countDocuments({ slot_id: id });
  if (count > 0) {
    throw new Error("Cannot delete slot with existing bookings");
  }
  await PickupSlot.findByIdAndDelete(id);
  return { message: "Slot deleted" };
};

exports.incrementBookedCount = async (id) => {
  return await PickupSlot.findByIdAndUpdate(
    id,
    { $inc: { booked_count: 1 } },
    { new: true },
  );
};

exports.decrementBookedCount = async (id) => {
  return await PickupSlot.findByIdAndUpdate(
    id,
    { $inc: { booked_count: -1 } },
    { new: true },
  );
};
