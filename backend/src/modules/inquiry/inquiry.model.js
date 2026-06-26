const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true },
    metal_preference: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    budget_min: { type: Number, min: 0 },
    budget_max: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["submitted", "under_review", "quoted", "closed"],
      default: "submitted",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

module.exports = mongoose.model("Inquiry", inquirySchema);
