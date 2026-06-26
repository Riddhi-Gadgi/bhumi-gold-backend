const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: Number,
      unique: true,
      required: true,
      validate: {
        validator: function (value) {
          return /^\d{10}$/.test(value.toString());
        },
        message: "Phone number must be exactly 10 digits",
      },
    },
    password_hash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "customer"],
      required: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false,
    },
  },
);

module.exports = mongoose.model("User", userSchema);
