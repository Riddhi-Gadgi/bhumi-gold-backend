const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: { type: String, maxlength: 200 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } },
);

// Auto‑generate slug from name before saving (async version – no next parameter)
categorySchema.pre("save", async function () {
  if (!this.slug || this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
});

module.exports = mongoose.model("Category", categorySchema);
