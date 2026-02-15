const mongoose = require('mongoose');

const groceryListSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: {
            type: String,
            required: true,
        },
        quantity: {
            type: String,
            required: true,
        },
        unit: {
            type: String,
        },
        quality: {
            type: String, // e.g., Grade A, Organic, etc.
        },
        brandPreference: {
            type: String, // e.g., Fortune, Tata, or "Any good brand"
        },
        specifications: {
            type: String, // e.g., "Must be freshly packed", "No broken grains"
        }
    }],
    expectedPrice: {
        type: Number,
    },
    expiredAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['open', 'closed'],
        default: 'open',
    },
}, { timestamps: true });

module.exports = mongoose.model('GroceryList', groceryListSchema);
