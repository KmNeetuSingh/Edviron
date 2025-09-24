const Order = require('../models/Order');
const OrderStatus = require('../models/OrderStatus');

// Get all transactions with MongoDB aggregation
exports.getAllTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      status,
      gateway,
      school_id
    } = req.query;

    // Build aggregation pipeline
    const pipeline = [
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      {
        $unwind: {
          path: '$status_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: 1,
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          custom_order_id: 1,
          payment_mode: '$status_info.payment_mode',
          payment_time: '$status_info.payment_time',
          createdAt: 1,
          updatedAt: 1
        }
      }
    ];

    // Add filters
    const matchStage = {};
    if (status) matchStage['status_info.status'] = status;
    if (gateway) matchStage.gateway = gateway;
    if (school_id) matchStage.school_id = school_id;

    if (Object.keys(matchStage).length > 0) {
      pipeline.unshift({ $match: matchStage });
    }

    // Add sorting
    const sortStage = {};
    sortStage[sort] = order === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortStage });

    // Add pagination
    pipeline.push(
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    );

    const transactions = await Order.aggregate(pipeline);

    // Get total count for pagination
    const countPipeline = [...pipeline];
    countPipeline.splice(-2); // Remove skip and limit
    countPipeline.push({ $count: 'total' });

    const countResult = await Order.aggregate(countPipeline);
    const total = countResult[0]?.total || 0;

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

// Get transactions by school
exports.getTransactionsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    const transactions = await Order.aggregate([
      { $match: { school_id: schoolId } },
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      {
        $unwind: {
          path: '$status_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          collect_id: '$_id',
          school_id: 1,
          gateway: '$gateway_name',
          order_amount: 1,
          transaction_amount: '$status_info.transaction_amount',
          status: '$status_info.status',
          custom_order_id: 1,
          payment_mode: '$status_info.payment_mode',
          payment_time: '$status_info.payment_time',
          createdAt: 1,
          updatedAt: 1
        }
      },
      { $sort: { [sort]: order === 'desc' ? -1 : 1 } },
      { $skip: (page - 1) * limit },
      { $limit: parseInt(limit) }
    ]);

    res.status(200).json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: transactions.length
      }
    });
  } catch (err) {
    console.error('Error fetching school transactions:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

// Get transaction status by custom order ID
exports.getTransactionStatus = async (req, res) => {
  try {
    const { custom_order_id } = req.params;

    const order = await Order.findOne({ custom_order_id });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const orderStatus = await OrderStatus.findOne({ collect_id: order._id });

    res.status(200).json({
      success: true,
      transaction: {
        custom_order_id,
        order_id: order._id,
        school_id: order.school_id,
        order_amount: order.order_amount,
        status: orderStatus?.status || 'pending',
        transaction_amount: orderStatus?.transaction_amount,
        payment_mode: orderStatus?.payment_mode,
        gateway_transaction_id: orderStatus?.gateway_transaction_id,
        payment_message: orderStatus?.payment_message,
        payment_time: orderStatus?.payment_time,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      }
    });
  } catch (err) {
    console.error('Error fetching transaction status:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};

// Get transaction statistics
exports.getTransactionStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $lookup: {
          from: 'orderstatuses',
          localField: '_id',
          foreignField: 'collect_id',
          as: 'status_info'
        }
      },
      {
        $unwind: {
          path: '$status_info',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: null,
          total_orders: { $sum: 1 },
          total_amount: { $sum: '$order_amount' },
          total_transactions: { $sum: { $cond: ['$status_info', 1, 0] } },
          successful_transactions: {
            $sum: { $cond: [{ $eq: ['$status_info.status', 'success'] }, 1, 0] }
          },
          failed_transactions: {
            $sum: { $cond: [{ $eq: ['$status_info.status', 'failed'] }, 1, 0] }
          },
          pending_transactions: {
            $sum: { $cond: [{ $eq: ['$status_info.status', 'pending'] }, 1, 0] }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        total_orders: 0,
        total_amount: 0,
        total_transactions: 0,
        successful_transactions: 0,
        failed_transactions: 0,
        pending_transactions: 0
      }
    });
  } catch (err) {
    console.error('Error fetching transaction stats:', err);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: err.message
    });
  }
};
