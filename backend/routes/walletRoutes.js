const express = require('express');
const router = express.Router();
const { getWalletData, createRechargeOrder, verifyRecharge, getGlobalTransactions } = require('../controllers/walletController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getWalletData);
router.get('/all', protect, authorize('admin'), getGlobalTransactions);
router.post('/recharge', protect, createRechargeOrder);
router.post('/verify', protect, verifyRecharge);

module.exports = router;
