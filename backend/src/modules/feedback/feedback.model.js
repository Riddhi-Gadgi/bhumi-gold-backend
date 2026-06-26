const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order" }, // optional
    message: { type: String, required: true, trim: true, maxlength: 2000 },
    rating: { type: Number, min: 1, max: 5, default: null }, // optional store rating
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

module.exports = mongoose.model("Feedback", feedbackSchema);
