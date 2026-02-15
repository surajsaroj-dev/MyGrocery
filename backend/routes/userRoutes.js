const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, createUser, updateUser, updateUserProfile, toggleUserStatus, getReferralStats, convertRewardsToWallet } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/profile')
    .put(protect, upload.single('profileImage'), updateUserProfile);

router.route('/:id/status')
    .put(protect, authorize('admin'), toggleUserStatus);

router.route('/')
    .get(protect, authorize('admin'), getUsers)
    .post(protect, authorize('admin'), createUser);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteUser)
    .put(protect, authorize('admin'), updateUser);

router.route('/:id/verify')
    .put(protect, authorize('admin'), require('../controllers/userController').verifyUser);

router.route('/stats/referrals')
    .get(protect, getReferralStats);

router.route('/referrals/convert')
    .post(protect, convertRewardsToWallet);

module.exports = router;
