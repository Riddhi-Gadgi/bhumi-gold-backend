const mongoose = require("mongoose");

const customizationSchema = new mongoose.Schema(
  {
    quotation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      default: null,
    }, // set after product creation
    required_weight: { type: Number, required: true, min: 0 },
    start_date: { type: Date, default: null },
    completion_date: { type: Date, default: null },
    status: {
      type: String,
      enum: ["pending", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

module.exports = mongoose.model("Customization", customizationSchema);
