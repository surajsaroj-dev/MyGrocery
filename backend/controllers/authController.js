const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role, address, phone, referralByCode } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate unique referral code
        const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        // Check if referred by someone
        let referredBy = null;
        let initialRewards = 0;
        const Transaction = require('../models/Transaction');

        if (referralByCode) {
            const referrer = await User.findOne({ referralCode: referralByCode });
            if (referrer) {
                referredBy = referrer._id;
                initialRewards = 50; // New user gets 50 points
                // Referrer gets 100 points
                referrer.referralRewards = (referrer.referralRewards || 0) + 100;
                await referrer.save();

                // Log Transaction for Referrer
                await Transaction.create({
                    userId: referrer._id,
                    amount: 100,
                    type: 'referral_commission',
                    status: 'completed',
                    description: `Referral reward for inviting ${name}`
                });
            }
        }

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            address,
            phone,
            referralCode,
            referredBy,
            referralRewards: initialRewards,
            isVerified: role === 'buyer' || role === 'admin'
        });

        if (user && initialRewards > 0) {
            // Log Transaction for New User
            await Transaction.create({
                userId: user._id,
                amount: initialRewards,
                type: 'deposit',
                status: 'completed',
                description: 'Initial referral welcome bonus'
            });
        }

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                profileImage: user.profileImage,
                referralRewards: user.referralRewards,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log('Login failed: User not found');
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (user.isActive === false) {
            console.log('Login failed: User account is inactive');
            return res.status(401).json({ message: 'Your account is inactive. Please contact Admin.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            if (user.role === 'vendor' && !user.isVerified) {
                console.log('Login failed: Vendor not verified');
                return res.status(401).json({ message: 'Your account is pending approval from Admin.' });
            }
            console.log('Login successful:', user._id);
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                profileImage: user.profileImage,
                token: generateToken(user._id),
            });
        } else {
            console.log('Login failed: Incorrect password');
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('SERVER ERROR in loginUser:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot password - Send OTP
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before saving
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        user.resetPasswordOtp = hashedOtp;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send email
        const message = `Your password reset OTP is: ${otp}\n\nThis OTP is valid for 10 minutes.`;

        try {
            console.log('Attempting to send email to:', user.email);
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message,
            });

            res.json({ message: 'OTP sent to email' });
        } catch (error) {
            console.error('Email sending error:', error);
            user.resetPasswordOtp = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return res.status(500).json({ message: 'Email could not be sent', error: error.message });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reset password using OTP
// @route   POST /api/auth/resetpassword
// @access  Public
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        // Hash the provided OTP
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email,
            resetPasswordOtp: hashedOtp,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    forgotPassword,
    resetPassword
};
