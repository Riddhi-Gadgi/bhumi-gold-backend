const mongoose = require("mongoose");

const metalSchema = new mongoose.Schema(
  {
    metal_name: {
      type: String,
      required: true,
      trim: true,
    },
    purity: {
      type: String,
      required: true,
      trim: true,
    },
    unit: {
      type: String,
      default: "gram",
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  },
);

// Prevent duplicate metal + purity combination
metalSchema.index({ metal_name: 1, purity: 1 }, { unique: true });

// Optional: Faster searching
metalSchema.index({ metal_name: 1 });

module.exports = mongoose.model("Metal", metalSchema);
