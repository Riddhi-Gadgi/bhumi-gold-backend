const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoice_number: { type: String, required: true, unique: true },
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  invoice_date: { type: Date, default: Date.now },
  due_date: { type: Date },
  total_amount: { type: Number, required: true },
  tax_amount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grand_total: { type: Number, required: true },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'cancelled'],
    default: 'draft'
  },
  pdf_url: { type: String }, // optional, for generated PDF
  notes: { type: String }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = mongoose.model('Invoice', invoiceSchema);