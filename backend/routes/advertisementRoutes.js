const express = require('express');
const router = express.Router();
const { getActiveAds, getAllAds, createAd, updateAd, deleteAd } = require('../controllers/advertisementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getActiveAds)
    .post(protect, authorize('admin'), createAd);

router.route('/all')
    .get(protect, authorize('admin'), getAllAds);

router.route('/:id')
    .put(protect, authorize('admin'), updateAd)
    .delete(protect, authorize('admin'), deleteAd);

module.exports = router;
