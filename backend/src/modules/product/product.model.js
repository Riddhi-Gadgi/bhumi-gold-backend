const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    customization_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customization",
      default: null,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    metal_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metal",
      required: true,
    },
    metal_rate_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MetalRate",
      required: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    weight_grams: { type: Number, required: true, min: 0 },
    making_charge: { type: Number, required: true, min: 0 },
    gst_percent: { type: Number, required: true, min: 0 },
    total_price: { type: Number, required: true, min: 0 },
    use_dynamic_pricing: { type: Boolean, default: true },
    // stock_qty: { type: Number, default: 0, min: 0 }, // for readymade products
    images: [{ type: String, trim: true }], // 👈 new field for product images
    is_custom: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

module.exports = mongoose.model("Product", productSchema);
