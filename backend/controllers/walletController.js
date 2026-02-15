const Transaction = require('../models/Transaction');
const User = require('../models/User');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
});

// @desc    Get user wallet balance and history
// @route   GET /api/wallet
// @access  Private
const getWalletData = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('walletBalance referralCode');
        const transactions = await Transaction.find({ userId: req.user._id })
            .populate('buyerId', 'name')
            .populate('vendorId', 'name')
            .sort({ createdAt: -1 });

        res.json({
            balance: user.walletBalance,
            referralCode: user.referralCode,
            transactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all transactions (Admin)
// @route   GET /api/wallet/all
// @access  Private/Admin
const getGlobalTransactions = async (req, res) => {
    console.log('getGlobalTransactions called by Admin:', req.user._id);
    try {
        const transactions = await Transaction.find({})
            .populate('userId', 'name email role')
            .populate('buyerId', 'name email')
            .populate('vendorId', 'name email')
            .populate('orderId', '_id deliveryStatus')
            .sort({ createdAt: -1 });

        console.log(`getGlobalTransactions found ${transactions.length} transactions`);
        res.json(transactions);
    } catch (error) {
        console.error('ERROR in getGlobalTransactions:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Razorpay order for wallet recharge
// @route   POST /api/wallet/recharge
// @access  Private
const createRechargeOrder = async (req, res) => {
    const { amount } = req.body;

    try {
        const options = {
            amount: amount * 100, // in paise
            currency: "INR",
            receipt: `recharge_${req.user._id}_${Date.now()}`,
        };

        const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'YOUR_KEY_ID';

        if (isMock) {
            const mockOrderId = `mock_recharge_${Date.now()}`;
            await Transaction.create({
                userId: req.user._id,
                amount,
                type: 'deposit',
                status: 'pending',
                description: 'Wallet Recharge (MOCK)',
                razorpayOrderId: mockOrderId
            });

            return res.json({
                id: mockOrderId,
                currency: "INR",
                amount: amount * 100,
                keyId: 'YOUR_KEY_ID',
                isMock: true
            });
        }

        const razorpayOrder = await razorpay.orders.create(options);

        // Create a pending transaction
        await Transaction.create({
            userId: req.user._id,
            amount,
            type: 'deposit',
            status: 'pending',
            description: 'Wallet Recharge',
            razorpayOrderId: razorpayOrder.id
        });

        res.json({
            id: razorpayOrder.id,
            currency: razorpayOrder.currency,
            amount: razorpayOrder.amount,
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify wallet recharge payment
// @route   POST /api/wallet/verify
// @access  Private
const verifyRecharge = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const isMock = razorpay_order_id.startsWith('mock_recharge_');
    const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET';

    let isAuthentic = false;

    if (isMock) {
        isAuthentic = true; // Auto-verify mock recharge
    } else {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');
        isAuthentic = expectedSignature === razorpay_signature;
    }

    if (isAuthentic) {
        try {
            const transaction = await Transaction.findOne({ razorpayOrderId: razorpay_order_id });

            if (transaction && transaction.status === 'pending') {
                transaction.status = 'completed';
                transaction.razorpayPaymentId = razorpay_payment_id;
                await transaction.save();

                // Update user wallet balance
                const user = await User.findById(req.user._id);
                user.walletBalance += transaction.amount;
                await user.save();

                res.json({ message: 'Wallet recharged successfully', balance: user.walletBalance });
            } else {
                res.status(404).json({ message: 'Transaction not found or already processed' });
            }
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    } else {
        res.status(400).json({ message: 'Invalid payment signature' });
    }
};

module.exports = {
    getWalletData,
    createRechargeOrder,
    verifyRecharge,
    getGlobalTransactions
};
