const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    order_number: { type: String, unique: true, required: true },
    total_amount: { type: Number, required: true, min: 0 },
    advance_paid: { type: Number, default: 0 },
    remaining_amount: { type: Number, required: true },
    payment_status: {
      type: String,
      enum: ["pending", "partial", "paid", "failed"],
      default: "pending",
    },
    order_status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in_production",
        "ready",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    pickup_slot_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PickupSlot",
      default: null,
    },
    billing_address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    notes: { type: String },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

module.exports = mongoose.model("Order", orderSchema);
