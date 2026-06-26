// modules/metalRate/metalRate.model.js
const mongoose = require("mongoose");

const metalRateSchema = new mongoose.Schema(
  {
    metal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metal",
      required: true,
    },
    rate_per_gram: {
      type: mongoose.Decimal128,
      required: true,
      min: 0,
    },
    effective_date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

// Index for faster queries
metalRateSchema.index({ metal_id: 1, effective_date: -1 });
metalRateSchema.index({ metal_id: 1, effective_date: 1 }, { unique: true });

module.exports = mongoose.model("MetalRate", metalRateSchema);