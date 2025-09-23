const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');

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
