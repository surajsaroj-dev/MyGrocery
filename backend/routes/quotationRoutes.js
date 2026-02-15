const express = require('express');
const router = express.Router();
const {
    createQuotation,
    getQuotations,
} = require('../controllers/quotationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('vendor'), createQuotation)
    .get(protect, getQuotations);

module.exports = router;
