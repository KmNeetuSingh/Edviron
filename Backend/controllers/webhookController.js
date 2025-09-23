const WebhookLogs = require('../models/WebhookLogs');
const OrderStatus = require('../models/OrderStatus');

exports.handleWebhook = async (req, res) => {
  const payload = req.body;

  try {
    const log = new WebhookLogs({
      webhook_id: payload.id || Date.now(),
      event_type: payload.event || 'unknown',
      payload,
      headers: req.headers,
      source_ip: req.ip
    });
    await log.save();

    // Example: if payment success, update order
    if (payload.status === 'success' && payload.orderId) {
      await OrderStatus.findOneAndUpdate(
        { collect_id: payload.orderId },
        { status: 'success', gateway_response: payload }
      );
    }

    res.status(200).json({ message: 'Webhook received' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Webhook error' });
  }
};
