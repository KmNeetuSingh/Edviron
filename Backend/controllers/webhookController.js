const WebhookLogs = require('../models/WebhookLogs');
const OrderStatus = require('../models/OrderStatus');
const Order = require('../models/Order');

exports.handleWebhook = async (req, res) => {
  const payload = req.body;

  try {
    // Log webhook
    const log = new WebhookLogs({
      webhook_id: payload.order_info?.order_id || Date.now().toString(),
      event_type: 'payment_update',
      payload,
      headers: req.headers,
      source_ip: req.ip,
      status_code: payload.status || 200
    });
    await log.save();

    // Process webhook payload according to assessment format
    if (payload.order_info) {
      const { order_info } = payload;
      
      // Find order by custom_order_id or collect_id
      let order = await Order.findOne({ custom_order_id: order_info.order_id });
      if (!order) {
        order = await Order.findById(order_info.order_id);
      }

      if (order) {
        // Update or create OrderStatus
        const orderStatusData = {
          collect_id: order._id,
          order_amount: order_info.order_amount,
          transaction_amount: order_info.transaction_amount,
          payment_mode: order_info.payment_mode,
          payment_details: order_info.payemnt_details || order_info.payment_details,
          bank_reference: order_info.bank_reference,
          payment_message: order_info.Payment_message || order_info.payment_message,
          status: order_info.status,
          error_message: order_info.error_message,
          payment_time: new Date(order_info.payment_time),
          gateway_transaction_id: order_info.order_id
        };

        await OrderStatus.findOneAndUpdate(
          { collect_id: order._id },
          orderStatusData,
          { upsert: true, new: true }
        );

        // Update main order status
        await Order.findByIdAndUpdate(order._id, { 
          status: order_info.status === 'success' ? 'completed' : 'failed' 
        });
      }
    }

    res.status(200).json({ 
      success: true,
      message: 'Webhook processed successfully' 
    });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Webhook processing failed',
      error: err.message 
    });
  }
};
