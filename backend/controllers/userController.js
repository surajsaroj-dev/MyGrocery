const User = require('../models/User');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;

        const keyword = req.query.keyword
            ? {
                $or: [
                    { name: { $regex: req.query.keyword, $options: 'i' } },
                    { email: { $regex: req.query.keyword, $options: 'i' } },
                ],
            }
            : {};

        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

        const usersCount = await User.countDocuments({ ...keyword, isDeleted: { $ne: true } });
        const users = await User.find({ ...keyword, isDeleted: { $ne: true } })
            .sort({ [sortBy]: sortOrder })
            .limit(limit)
            .skip(skip);

        res.json({
            users,
            page,
            pages: Math.ceil(usersCount / limit),
            total: usersCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Toggle user active status
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
    console.log('toggleUserStatus called for ID:', req.params.id);
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            console.warn('toggleUserStatus: User not found:', req.params.id);
            return res.status(404).json({ message: 'User not found' });
        }

        user.isActive = !user.isActive;
        await user.save();
        console.log('User status toggled successfully:', user._id, 'New status:', user.isActive);

        res.json({ message: `User is now ${user.isActive ? 'active' : 'inactive'}`, isActive: user.isActive });
    } catch (error) {
        console.error('SERVER ERROR in toggleUserStatus:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a user
// @route   POST /api/users
// @access  Private/Admin
const createUser = async (req, res) => {
    console.log('createUser req.body:', req.body);
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate unique referral code (same as in authController)
        const referralCode = crypto.randomBytes(4).toString('hex').toUpperCase();

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            referralCode,
            isVerified: true // Admin-created users are auto-verified
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                referralCode: user.referralCode,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('createUser error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            // Password update can be handled here if needed, but keeping it simple for now

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile (Self)
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        console.log('Update Profile Request for ID:', req.user?._id);
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.address = req.body.address || user.address;
            user.phone = req.body.phone || user.phone;

            if (req.file) {
                user.profileImage = req.file.path.replace(/\\/g, '/'); // Use forward slashes
            }

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();
            console.log('User updated successfully:', updatedUser._id);

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                address: updatedUser.address,
                phone: updatedUser.phone,
                profileImage: updatedUser.profileImage,
                token: generateToken(updatedUser._id),
            });
        } else {
            console.warn('Update Profile: User not found for ID:', req.user._id);
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('SERVER ERROR in updateUserProfile:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isDeleted = true;
            await user.save();
            res.json({ message: 'User removed' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify a user (Vendor)
// @route   PUT /api/users/:id/verify
// @access  Private/Admin
const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            user.isVerified = true;
            await user.save();
            res.json({ message: 'User verified' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get referral statistics for logged in user
// @route   GET /api/users/referrals
// @access  Private
const getReferralStats = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const referredUsers = await User.find({ referredBy: req.user._id }).select('name email createdAt');

        res.json({
            count: referredUsers.length,
            rewards: user.referralRewards || 0,
            referralCode: user.referralCode,
            history: referredUsers
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Convert referral rewards to wallet cash
// @route   POST /api/users/referrals/convert
// @access  Private
const convertRewardsToWallet = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.referralRewards || user.referralRewards <= 0) {
            return res.status(400).json({ message: 'No rewards to convert' });
        }

        const amountToConvert = user.referralRewards;
        user.walletBalance = (user.walletBalance || 0) + amountToConvert;
        user.referralRewards = 0;

        await user.save();

        res.json({
            message: `Successfully converted ${amountToConvert} points to wallet cash`,
            walletBalance: user.walletBalance,
            referralRewards: user.referralRewards
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    deleteUser,
    verifyUser,
    getReferralStats,
    createUser,
    updateUser,
    updateUserProfile,
    toggleUserStatus,
    convertRewardsToWallet
};
