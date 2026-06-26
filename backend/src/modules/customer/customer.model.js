const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one customer per user
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },
    date_of_birth: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: false, // no updated_at field
    },
  },
);

module.exports = mongoose.model("Customer", customerSchema);
