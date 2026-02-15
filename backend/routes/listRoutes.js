const express = require('express');
const router = express.Router();
const {
    createList,
    getLists,
    getListById,
    deleteList,
    addItemToList,
} = require('../controllers/listController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, authorize('buyer'), createList)
    .get(protect, getLists);

router.route('/:id')
    .get(protect, getListById)
    .delete(protect, deleteList);

router.route('/:id/items')
    .post(protect, authorize('buyer'), addItemToList);

module.exports = router;
