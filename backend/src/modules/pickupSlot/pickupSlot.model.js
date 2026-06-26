const mongoose = require("mongoose");

const pickupSlotSchema = new mongoose.Schema(
  {
    slot_date: { type: Date, required: true },
    start_time: { type: String, required: true }, // "HH:MM"
    end_time: { type: String, required: true },
    max_capacity: { type: Number, default: 5, min: 1 },
    booked_count: { type: Number, default: 0, min: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

module.exports = mongoose.model("PickupSlot", pickupSlotSchema);
