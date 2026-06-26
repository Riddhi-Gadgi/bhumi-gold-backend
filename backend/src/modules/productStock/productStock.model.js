const mongoose = require("mongoose");

const productStockSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true,
  },
  available_quantity: { type: Number, required: true, min: 0 },
  reserved_quantity: { type: Number, default: 0, min: 0 },
  last_updated: { type: Date, default: Date.now },
});

// Async pre-save hook – no `next` parameter (fixes "next is not a function")
productStockSchema.pre("save", async function () {
  this.last_updated = new Date();
});

// Pre-findOneAndUpdate hook – already correct
productStockSchema.pre("findOneAndUpdate", function () {
  this.set({ last_updated: new Date() });
});

// Virtual for net available
productStockSchema.virtual("net_available").get(function () {
  return this.available_quantity - this.reserved_quantity;
});

module.exports = mongoose.model("ProductStock", productStockSchema);
