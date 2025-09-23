const OrderStatus = require('../models/OrderStatus');

// Get transaction history
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await OrderStatus.find().populate('collect_id');
    res.status(200).json({ transactions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  const id = req.params.id;
  try {
    const transaction = await OrderStatus.findById(id).populate('collect_id');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.status(200).json({ transaction });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
