const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const {
  getAllTransactions,
  getTransactionsBySchool,
  getTransactionStatus,
  getTransactionStats
} = require('../controllers/transactionController');
const { auth: authenticate } = require('../middleware/auth');

// GET /transactions - Fetch all transactions with pagination and filtering
router.get('/', authenticate, [
  check('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  check('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  check('sort').optional().isIn(['createdAt', 'order_amount', 'payment_time', 'status']).withMessage('Invalid sort field'),
  check('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc'),
  check('status').optional().isIn(['pending', 'success', 'failed', 'cancelled']).withMessage('Invalid status'),
  check('gateway').optional().isIn(['PhonePe', 'Razorpay', 'Paytm', 'UPI']).withMessage('Invalid gateway'),
  check('school_id').optional().isMongoId().withMessage('Invalid school ID')
], getAllTransactions);

// GET /transactions/school/:schoolId - Fetch transactions by school
router.get('/school/:schoolId', authenticate, [
  check('schoolId').isMongoId().withMessage('Invalid school ID'),
  check('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  check('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  check('sort').optional().isIn(['createdAt', 'order_amount', 'payment_time', 'status']).withMessage('Invalid sort field'),
  check('order').optional().isIn(['asc', 'desc']).withMessage('Order must be asc or desc')
], getTransactionsBySchool);

// GET /transaction-status/:custom_order_id - Check transaction status
router.get('/transaction-status/:custom_order_id', authenticate, [
  check('custom_order_id').notEmpty().withMessage('Custom order ID is required')
], getTransactionStatus);

// GET /transactions/stats - Get transaction statistics
router.get('/stats', authenticate, getTransactionStats);

module.exports = router;
