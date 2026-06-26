const Pickup = require("./pickup.model");
const PickupSlot = require("../pickupSlot/pickupSlot.model");
const Order = require("../order/order.model");

exports.createPickup = async (order_id, slot_id) => {
  // Check if slot is available
  const slot = await PickupSlot.findById(slot_id);
  if (!slot) throw new Error("Slot not found");
  if (!slot.is_active) throw new Error("Slot is inactive");
  if (slot.booked_count >= slot.max_capacity) throw new Error("Slot is full");

  // Check if order exists and is ready for pickup
  const order = await Order.findById(order_id);
  if (!order) throw new Error("Order not found");
  // Optionally check order status (should be 'ready' or 'completed'?)

  // Create pickup
  const pickup = await Pickup.create({ order_id, slot_id });

  // Increment slot booked count
  slot.booked_count += 1;
  await slot.save();

  return pickup;
};

exports.getPickupById = async (id) => {
  return await Pickup.findById(id)
    .populate("order_id")
    .populate("slot_id")
    .lean();
};

exports.getPickupByOrder = async (order_id) => {
  return await Pickup.findOne({ order_id }).populate("slot_id").lean();
};

exports.getAllPickups = async (filter = {}) => {
  return await Pickup.find(filter)
    .populate("order_id")
    .populate("slot_id")
    .sort({ created_at: -1 })
    .lean();
};

exports.updatePickupStatus = async (id, status) => {
  const pickup = await Pickup.findById(id);
  if (!pickup) throw new Error("Pickup not found");
  pickup.pickup_status = status;
  await pickup.save();
  return pickup;
};

exports.reschedulePickup = async (id, new_slot_id) => {
  const pickup = await Pickup.findById(id);
  if (!pickup) throw new Error("Pickup not found");

  // Decrement old slot count
  await PickupSlot.findByIdAndUpdate(pickup.slot_id, {
    $inc: { booked_count: -1 },
  });

  // Check new slot availability
  const newSlot = await PickupSlot.findById(new_slot_id);
  if (!newSlot) throw new Error("New slot not found");
  if (!newSlot.is_active) throw new Error("New slot is inactive");
  if (newSlot.booked_count >= newSlot.max_capacity)
    throw new Error("New slot is full");

  // Update pickup
  pickup.slot_id = new_slot_id;
  pickup.pickup_status = "rescheduled";
  await pickup.save();

  // Increment new slot count
  newSlot.booked_count += 1;
  await newSlot.save();

  return pickup;
};

exports.confirmPickup = async (id) => {
  const pickup = await Pickup.findById(id);
  if (!pickup) throw new Error("Pickup not found");
  pickup.pickup_status = "picked";
  await pickup.save();

  // Optionally update order status to 'completed'
  await Order.findByIdAndUpdate(pickup.order_id, { order_status: "completed" });

  return pickup;
};
