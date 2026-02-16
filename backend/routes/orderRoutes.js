const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderToPaid, updateOrderStatus, trackOrder, assignLogistics, updateLogisticsStatus } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('buyer'), createOrder)
    .get(protect, getOrders);

router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/status').put(protect, authorize('vendor'), updateOrderStatus);
router.route('/:id/assign').put(protect, authorize('admin'), assignLogistics);
router.route('/:id/logistics-status').put(protect, authorize('logistics'), updateLogisticsStatus);

module.exports = router;
