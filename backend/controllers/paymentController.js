const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Initialize Razorpay
// Note: Using placeholders as requested. User must update .env
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'YOUR_KEY_ID',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET'
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private (Buyer)
const createPaymentOrder = async (req, res) => {
    const { orderId } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const options = {
            amount: order.totalAmount * 100, // Amount in smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_order_${order._id}`,
        };

        const isMock = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID === 'YOUR_KEY_ID';

        if (isMock) {
            return res.json({
                id: `mock_order_${Date.now()}`,
                currency: "INR",
                amount: order.totalAmount * 100,
                keyId: 'YOUR_KEY_ID',
                isMock: true
            });
        }

        const razorpayOrder = await razorpay.orders.create(options);

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

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/verify
// @access  Private (Buyer)
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const isMock = razorpay_order_id.startsWith('mock_order_');
    const secret = process.env.RAZORPAY_KEY_SECRET || 'YOUR_KEY_SECRET';

    let isAuthentic = false;

    if (isMock) {
        isAuthentic = true; // Auto-verify mock payments
    } else {
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');
        isAuthentic = expectedSignature === razorpay_signature;
    }

    if (isAuthentic) {
        // Update local order status
        const order = await Order.findById(orderId).populate('buyerId vendorId');
        if (order) {
            order.paymentStatus = 'paid';
            await order.save();

            // Create Transaction record for the payment itself
            await Transaction.create({
                userId: order.buyerId._id,
                buyerId: order.buyerId._id,
                vendorId: order.vendorId._id,
                orderId: order._id,
                amount: order.totalAmount,
                type: 'order_payment',
                status: 'completed',
                description: `Payment for Order #${order._id.toString().substring(18)} to ${order.vendorId.name}`,
                razorpayOrderId: razorpay_order_id,
                razorpayPaymentId: razorpay_payment_id
            });

            // --- REVENUE MODEL: Royalty & Referral Commissions ---
            const ROYALTY_PERCENT = 0.002; // 0.2%
            const REFERRAL_PERCENT = 0.1; // 10% of the royalty goes to the referrer

            const royaltyAmount = order.totalAmount * ROYALTY_PERCENT;
            const vendor = order.vendorId;

            // Deduct royalty from vendor wallet
            if (vendor) {
                vendor.walletBalance -= royaltyAmount;
                await vendor.save();

                await Transaction.create({
                    userId: vendor._id,
                    buyerId: order.buyerId._id,
                    vendorId: vendor._id,
                    orderId: order._id,
                    amount: royaltyAmount,
                    type: 'royalty_deduction',
                    status: 'completed',
                    description: `Royalty deduction for Order: ${order._id}`,
                    referenceId: order._id
                });
            }

            // Handle Referral Commission
            const buyer = order.buyerId;
            if (buyer.referredBy) {
                const commissionAmount = royaltyAmount * REFERRAL_PERCENT;
                const referrer = await User.findById(buyer.referredBy);

                if (referrer) {
                    referrer.walletBalance += commissionAmount;
                    await referrer.save();

                    await Transaction.create({
                        userId: referrer._id,
                        buyerId: buyer._id,
                        vendorId: vendor._id,
                        orderId: order._id,
                        amount: commissionAmount,
                        type: 'referral_commission',
                        status: 'completed',
                        description: `Referral commission from Order: ${order._id}`,
                        referenceId: order._id
                    });
                }
            }

            res.json({ message: 'Payment successful', orderId });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } else {
        res.status(400).json({ message: 'Invalid signature' });
    }
};

module.exports = {
    createPaymentOrder,
    verifyPayment
};
