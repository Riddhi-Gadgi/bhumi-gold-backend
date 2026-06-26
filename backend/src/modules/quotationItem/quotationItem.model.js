const mongoose = require("mongoose");

const quotationItemSchema = new mongoose.Schema(
  {
    quotation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quotation",
      required: true,
    },
    metal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metal",
      required: true,
    },
    estimated_weight: { type: Number, required: true, min: 0 },
    metal_rate: { type: Number, required: true, min: 0 },
    making_charge: { type: Number, required: true, min: 0 },
    gst_amount: { type: Number, required: true, min: 0 },
    total_price: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

module.exports = mongoose.model("QuotationItem", quotationItemSchema);
