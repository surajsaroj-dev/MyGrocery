const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    quotationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quotation',
        required: true,
    },
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    logisticsId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending',
    },
    paymentMethod: {
        type: String,
        enum: ['online', 'cod'],
        default: 'cod',
    },
    deliveryStatus: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'dispatched', 'delivered'],
        default: 'pending',
    },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
