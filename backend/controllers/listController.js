const GroceryList = require('../models/GroceryList');

// @desc    Create a new grocery list
// @route   POST /api/lists
// @access  Private (Buyer)
const createList = async (req, res) => {
    const { title, items, expectedPrice, expiredAt } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ message: 'No items in the list' });
    }

    try {
        const list = new GroceryList({
            buyerId: req.user._id,
            title,
            items,
            expectedPrice,
            expiredAt,
            status: 'open',
        });

        const createdList = await list.save();
        await createdList.populate('buyerId', 'name phone');

        // Emit socket event
        const io = req.app.get('socketio');
        if (io) {
            io.emit('new_list', createdList);
        }

        res.status(201).json(createdList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all lists for logged in user (Buyer: own lists, Vendor: all open lists)
// @route   GET /api/lists
// @access  Private
const getLists = async (req, res) => {
    try {
        let lists;
        if (req.user.role === 'buyer') {
            lists = await GroceryList.find({ buyerId: req.user._id })
                .populate('items.product', 'name brand unit image')
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'vendor') {
            // Vendors see all open lists
            lists = await GroceryList.find({ status: 'open' })
                .populate('buyerId', 'name phone')
                .populate('items.product', 'name brand unit image')
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'admin') {
            lists = await GroceryList.find({})
                .populate('items.product', 'name brand unit image')
                .sort({ createdAt: -1 });
        } else {
            lists = [];
        }
        res.json(lists);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get list by ID
// @route   GET /api/lists/:id
// @access  Private
const getListById = async (req, res) => {
    try {
        const list = await GroceryList.findById(req.params.id)
            .populate('buyerId', 'name email address phone')
            .populate('items.product', 'name brand unit image');

        if (list) {
            // Check permission: Owner, Vendor (if open), or Admin
            if (
                req.user.role === 'admin' ||
                list.buyerId._id.toString() === req.user._id.toString() ||
                (req.user.role === 'vendor' && list.status === 'open')
            ) {
                res.json(list);
            } else {
                res.status(403).json({ message: 'Not authorized to view this list' });
            }
        } else {
            res.status(404).json({ message: 'List not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a list
// @route   DELETE /api/lists/:id
// @access  Private (Owner only)
const deleteList = async (req, res) => {
    try {
        const list = await GroceryList.findById(req.params.id);

        if (list) {
            if (list.buyerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to delete this list' });
            }

            await list.deleteOne();
            res.json({ message: 'List removed' });
        } else {
            res.status(404).json({ message: 'List not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Add an item to a list
// @route   POST /api/lists/:id/items
// @access  Private (Owner only)
const addItemToList = async (req, res) => {
    const { productId, quantity, unit } = req.body;

    try {
        const list = await GroceryList.findById(req.params.id);

        if (!list) {
            return res.status(404).json({ message: 'List not found' });
        }

        if (list.buyerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Check if product already exists in list
        const existingItemIndex = list.items.findIndex(item => item.product?.toString() === productId);

        if (existingItemIndex > -1) {
            list.items[existingItemIndex].quantity += Number(quantity);
        } else {
            // Get product name from Product model to be safe or just use productId
            const Product = require('../models/Product');
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ message: 'Product not found' });

            list.items.push({
                product: productId,
                name: product.name,
                quantity,
                unit: unit || product.unit
            });
        }

        await list.save();
        res.status(200).json(list);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createList,
    getLists,
    getListById,
    deleteList,
    addItemToList,
};
