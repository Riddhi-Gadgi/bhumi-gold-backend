const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
  inquiry_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Inquiry', required: true, unique: true },
  total_amount: { type: Number, required: true, min: 0 },
  advance_required: { type: Number, required: true, min: 0 },
  valid_until: { type: Date, required: true },
  status: {
    type: String,
    enum: ['sent', 'accepted', 'rejected', 'expired'],
    default: 'sent'
  }
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

module.exports = mongoose.model('Quotation', quotationSchema);