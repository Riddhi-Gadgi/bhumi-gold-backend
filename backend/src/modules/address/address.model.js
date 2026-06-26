const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    full_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    phone: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{10}$/.test(v);
        },
        message: "Phone number must be exactly 10 digits",
      },
    },
    address_line1: {
      type: String,
      required: true,
      maxlength: 255,
    },
    address_line2: {
      type: String,
      default: "",
      maxlength: 255,
    },
    area: {
      type: String,
      required: true,
      maxlength: 100,
    },
    pincode: {
      type: String,
      required: true,
      validate: {
        validator: function (v) {
          return /^\d{6}$/.test(v);
        },
        message: "Pincode must be exactly 6 digits",
      },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  },
);

module.exports = mongoose.model("Address", addressSchema);
