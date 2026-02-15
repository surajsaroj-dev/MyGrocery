const express = require('express');
const router = express.Router();
const { getProducts, createProduct, deleteProduct, updateProduct } = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getProducts)
    .post(protect, authorize('admin'), upload.single('image'), createProduct);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteProduct)
    .put(protect, authorize('admin'), upload.single('image'), updateProduct);

module.exports = router;
