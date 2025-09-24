const mongoose = require('mongoose');

const orderStatusSchema = new mongoose.Schema({
  collect_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order' },
  order_amount: Number,
  transaction_amount: Number,
  payment_mode: { type: String, enum: ['upi','card','netbanking','wallet','pending'] },
  payment_details: String,
  bank_reference: String,
  payment_message: String,
  status: { type: String, enum: ['pending','success','failed','cancelled'], default: 'pending' },
  payment_time: Date,
  gateway_transaction_id: String,
  gateway_response: Object
}, { timestamps: true });

// Indexes for performance optimization
orderStatusSchema.index({ collect_id: 1 });
orderStatusSchema.index({ status: 1 });
orderStatusSchema.index({ payment_time: -1 });
orderStatusSchema.index({ gateway_transaction_id: 1 });
orderStatusSchema.index({ collect_id: 1, status: 1 });
orderStatusSchema.index({ collect_id: 1, payment_time: -1 });

module.exports = mongoose.model('OrderStatus', orderStatusSchema);
