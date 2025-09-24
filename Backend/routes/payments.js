const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { createOrder, updateOrderStatus, getOrdersBySchool, createPayment } = require('../controllers/paymentController');
const { auth: authenticate } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');

// Create a new order
router.post('/create-order', authenticate, [
  check('school_id', 'School ID is required').notEmpty(),
  check('trustee_id', 'Trustee ID is required').notEmpty(),
  check('order_amount', 'Order amount is required and must be positive').isFloat({ min: 0.01 }),
  check('student_info.name', 'Student name is required').notEmpty(),
  check('student_info.email', 'Valid student email is required').isEmail(),
  check('gateway_name', 'Gateway name is required').isIn(['PhonePe', 'Razorpay', 'Paytm', 'UPI'])
], createOrder);

// Create payment with PhonePe gateway
router.post('/create-payment', authenticate, [
  check('order_amount', 'Order amount is required and must be positive').isFloat({ min: 0.01 }),
  check('student_info.name', 'Student name is required').notEmpty(),
  check('student_info.email', 'Valid student email is required').isEmail(),
  check('student_info.phone', 'Student phone is required').notEmpty()
], handleValidationErrors, createPayment);

// Update order status after payment
router.post('/update-order-status', authenticate, [
  check('orderId', 'Order ID is required').notEmpty(),
  check('status', 'Status is required').isIn(['success', 'failed', 'cancelled']),
  check('transaction_amount', 'Transaction amount is required').isFloat({ min: 0.01 }),
  check('payment_mode', 'Payment mode is required').notEmpty(),
  check('gateway_transaction_id', 'Gateway transaction ID is required').notEmpty()
], updateOrderStatus);

// Get all orders for a school
router.get('/school/:schoolId/orders', authenticate, getOrdersBySchool);

module.exports = router;
  