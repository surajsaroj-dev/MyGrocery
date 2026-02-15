const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
    originalListId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GroceryList',
        required: true,
    },
    vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    prices: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        itemName: { type: String, required: true },
        basePrice: { type: Number, required: true },
        discount: { type: Number, default: 0 }, // Percentage or flat? Let's use percentage for easier comparison
        finalPrice: { type: Number, required: true },
    }],
    totalAmount: {
        type: Number,
        required: true,
    },
    discountTotal: {
        type: Number,
        default: 0,
    },
    validUntil: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
    }
}, { timestamps: true });

module.exports = mongoose.model('Quotation', quotationSchema);
