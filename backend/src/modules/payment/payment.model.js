const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    quotation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      default: null,
    },
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    payment_type: { type: String, enum: ["advance", "final"], required: true },
    amount: { type: Number, required: true },
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String, required: true },
    razorpay_signature: { type: String, required: true },
    status: {
      type: String,
      enum: ["paid", "failed", "refunded"],
      default: "paid",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

module.exports = mongoose.model("Payment", paymentSchema);
