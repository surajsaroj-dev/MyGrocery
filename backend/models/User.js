const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['buyer', 'vendor', 'admin'],
        default: 'buyer',
    },
    address: {
        type: String,
    },
    phone: {
        type: String,
    },
    profileImage: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    walletBalance: {
        type: Number,
        default: 500,
    },
    referralCode: {
        type: String,
        unique: true,
    },
    referralRewards: {
        type: Number,
        default: 0,
    },
    referredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    businessDetails: {
        gstNumber: String,
        businessName: String,
    },
    resetPasswordOtp: String,
    resetPasswordExpire: Date,
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
