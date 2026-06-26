const mongoose = require("mongoose");

const metalStockTransactionSchema = new mongoose.Schema(
  {
    metal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metal",
      required: true,
      index: true,
    },
    transaction_type: {
      type: String,
      enum: [
        "purchase",
        "used_for_product",
        "reserved",
        "released",
        "adjustment",
      ],
      required: true,
    },
    quantity: {
      type: mongoose.Decimal128,
      required: true,
      min: 0,
    },
    reference_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  },
);

// Index for faster queries
metalStockTransactionSchema.index({ metal_id: 1, created_at: -1 });

module.exports = mongoose.model(
  "MetalStockTransaction",
  metalStockTransactionSchema,
);
