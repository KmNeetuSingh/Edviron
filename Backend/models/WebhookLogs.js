const mongoose = require('mongoose');

const webhookLogsSchema = new mongoose.Schema({
  webhook_id: { type: String, required: true, unique: true },
  event_type: String,
  payload: Object,
  headers: Object,
  status_code: Number,
  processed: { type: Boolean, default: false },
  error_message: String,
  retry_count: { type: Number, default: 0 },
  source_ip: String
}, { timestamps: true });

module.exports = mongoose.model('WebhookLogs', webhookLogsSchema);
