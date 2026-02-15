const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    type: {
        type: String,
        enum: ['deposit', 'withdrawal', 'bidding_charge', 'referral_commission', 'royalty_deduction', 'order_payment'],
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'completed',
    },
    description: {
        type: String,
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
    },
    referenceId: {
        type: mongoose.Schema.Types.ObjectId,
        // Could be an OrderId, QuotationId, etc.
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
