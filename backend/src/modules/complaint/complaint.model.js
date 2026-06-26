const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  admin_notes: { type: String, trim: true, maxlength: 1000 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Complaint', complaintSchema);