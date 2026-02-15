const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Get Admin Analytics
// @route   GET /api/analytics
// @access  Private/Admin
const getAnalytics = async (req, res) => {
    try {
        // 1. Total Sales (Paid Orders)
        const salesResult = await Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalSales = salesResult.length > 0 ? salesResult[0].total : 0;

        // 2. Counts
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        // 3. User Breakdown
        const buyersCount = await User.countDocuments({ role: 'buyer' });
        const vendorsCount = await User.countDocuments({ role: 'vendor' });

        // 4. Platform Earnings (Sum of royalties and bidding charges)
        const Transaction = require('../models/Transaction');
        const earningsResult = await Transaction.aggregate([
            { $match: { type: { $in: ['bidding_charge', 'royalty_deduction'] }, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const platformEarnings = earningsResult.length > 0 ? earningsResult[0].total : 0;

        res.json({
            totalSales,
            totalOrders,
            totalUsers,
            totalProducts,
            platformEarnings,
            userBreakdown: {
                buyers: buyersCount,
                vendors: vendorsCount
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAnalytics
};
