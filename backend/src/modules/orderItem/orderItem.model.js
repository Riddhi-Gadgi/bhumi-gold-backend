const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    price_at_purchase: { type: Number, required: true }, // snapshot price
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

module.exports = mongoose.model("OrderItem", orderItemSchema);
