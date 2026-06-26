const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, default: 1, min: 1 },
    price: { type: mongoose.Schema.Types.Decimal128, required: true }, // price at time of adding
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

module.exports = mongoose.model("CartItem", cartItemSchema);
