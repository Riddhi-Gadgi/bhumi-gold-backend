const mongoose = require("mongoose");

const productStockTransactionSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    transaction_type: {
      type: String,
      enum: ["added", "sold", "reserved", "released", "adjustment"],
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    reference_id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "reference_model",
    },
    reference_model: { type: String, enum: ["Order", "Cart", "Customization"] },
    notes: { type: String, trim: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

module.exports = mongoose.model(
  "ProductStockTransaction",
  productStockTransactionSchema,
);
