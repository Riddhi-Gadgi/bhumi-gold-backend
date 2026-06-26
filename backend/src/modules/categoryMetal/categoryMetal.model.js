const mongoose = require('mongoose');

const categoryMetalSchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  metal_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Metal', required: true }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// Ensure unique combination
categoryMetalSchema.index({ category_id: 1, metal_id: 1 }, { unique: true });

module.exports = mongoose.model('CategoryMetal', categoryMetalSchema);