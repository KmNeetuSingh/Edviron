const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Create a payment order
exports.createOrder = async (req, res) => {
  const { school_id, trustee_id, student_info, order_amount, gateway_name } = req.body;

  try {
    const order = new Order({ school_id, trustee_id, student_info, order_amount, gateway_name });
    await order.save();
    res.status(201).json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update order status after payment
exports.updateOrderStatus = async (req, res) => {
  const { orderId, status, transaction_amount, payment_mode, gateway_transaction_id, payment_message } = req.body;

  try {
    const orderStatus = new OrderStatus({
      collect_id: orderId,
      order_amount: transaction_amount,
      transaction_amount,
      payment_mode,
      status,
      gateway_transaction_id,
      payment_message
    });
    await orderStatus.save();

    // Update main order status
    await Order.findByIdAndUpdate(orderId, { status });
    res.status(200).json({ message: 'Order status updated', orderStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get all orders for a school
exports.getOrdersBySchool = async (req, res) => {
  const school_id = req.params.schoolId;
  try {
    const orders = await Order.find({ school_id }).populate('trustee_id', 'name email');
    res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create payment with PhonePe gateway integration
exports.createPayment = async (req, res) => {
  const { order_amount, student_info, gateway_name = 'PhonePe' } = req.body;

  try {
    // Create order first
    const order = new Order({
      school_id: '65b0e6293e9f76a9694d84b4', // From assessment
      trustee_id: req.user.id,
      student_info,
      order_amount,
      gateway_name
    });
    await order.save();

    // Prepare PhonePe payload
    const payload = {
      merchantId: process.env.PG_KEY || 'edvtest01',
      merchantTransactionId: order.custom_order_id,
      merchantUserId: req.user.id,
      amount: order_amount * 100, // Convert to paise
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-callback`,
      redirectMode: 'POST',
      callbackUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/webhooks`,
      mobileNumber: student_info.phone || '9999999999',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    // Sign the payload with JWT
    const apiKey = process.env.API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVlSWQiOiI2NWIwZTU1MmRkMzE5NTBhOWI0MWM1YmEiLCJJbmRleE9mQXBpS2V5Ijo2fQ.IJWTYCOurGCFdRM2xyKtw6TEcuwXxGnmINrXFfsAdt0';
    const signature = jwt.sign(payload, apiKey);

    // Call PhonePe API
    const response = await axios.post('https://api.phonepe.com/apis/hermes/pg/v1/pay', {
      request: Buffer.from(JSON.stringify(payload)).toString('base64'),
      signature
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': signature
      }
    });

    // Log the payment creation
    console.log('Payment created:', {
      order_id: order._id,
      custom_order_id: order.custom_order_id,
      amount: order_amount,
      phonepe_response: response.data
    });

    res.json({
      success: true,
      message: 'Payment initiated successfully',
      payment_url: response.data.data.instrumentResponse.redirectInfo.url,
      order_id: order._id,
      custom_order_id: order.custom_order_id
    });

  } catch (error) {
    console.error('Payment creation error:', error.response?.data || error.message);

    // If order was created but payment failed, mark it as failed
    if (error.response?.data) {
      await Order.findByIdAndUpdate(order._id, { status: 'failed' });
    }

    res.status(500).json({
      success: false,
      message: 'Payment creation failed',
      error: error.response?.data?.message || error.message
    });
  }
};
