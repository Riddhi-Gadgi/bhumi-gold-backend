const mongoose = require("mongoose");

const pickupSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    slot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PickupSlot",
      required: true,
    },
    pickup_status: {
      type: String,
      enum: ["scheduled", "picked", "missed", "rescheduled"],
      default: "scheduled",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Ensure one pickup per order
pickupSchema.index({ order_id: 1 }, { unique: true });

module.exports = mongoose.model("Pickup", pickupSchema);
