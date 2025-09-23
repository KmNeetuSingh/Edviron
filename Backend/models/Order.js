const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  school_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'School' },
  trustee_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  student_info: {
    name: String,
    id: String,
    email: String
  },
  gateway_name: { type: String, enum: ['PhonePe','Razorpay','Paytm','UPI'], default: 'PhonePe' },
  custom_order_id: { type: String, unique: true },
  order_amount: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created','processing','completed','failed'], default: 'created' }
}, { timestamps: true });

orderSchema.pre('save', function(next) {
  if (!this.custom_order_id) this.custom_order_id = `ORD_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
  next();
});

module.exports = mongoose.model('Order', orderSchema);
