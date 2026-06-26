const mongoose = require("mongoose");
const metalStockSchema = new mongoose.Schema({
  metal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Metal",
    required: true,
    unique: true,
  },
  available_quantity: {
    type: mongoose.Decimal128,
    required: true,
    min: 0,
  },
  reserved_quantity: {
    type: mongoose.Decimal128,
    default: 0,
    min: 0,
  },
  last_updated: {
    type: Date,
    default: Date.now,
  },
});

// Auto update last_updated on save (still useful for direct saves)
metalStockSchema.pre("save", function (next) {
  this.last_updated = new Date();
  next();
});

metalStockSchema.virtual("net_available").get(function () {
  return (
    parseFloat(this.available_quantity.toString()) -
    parseFloat(this.reserved_quantity.toString())
  );
});

module.exports = mongoose.model("MetalStock", metalStockSchema);
