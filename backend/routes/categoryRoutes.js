const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory, updateCategory } = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .get(getCategories)
    .post(protect, authorize('admin'), upload.single('image'), createCategory);

router.route('/:id')
    .delete(protect, authorize('admin'), deleteCategory)
    .put(protect, authorize('admin'), upload.single('image'), updateCategory);

module.exports = router;
