const Order = require('../models/Order');
const Quotation = require('../models/Quotation');
const GroceryList = require('../models/GroceryList');


const createOrder = async (req, res) => {
    const { quotationId, paymentMethod } = req.body;

    try {
        const quotation = await Quotation.findById(quotationId).populate('originalListId');

        if (!quotation) {
            return res.status(404).json({ message: 'Quotation not found' });
        }
        // Verify buyer owns the list
        const list = quotation.originalListId;
        if (list.buyerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to accept this quote' });
        }

        if (list.status !== 'open') {
            return res.status(400).json({ message: 'List is already closed' });
        }
        const order = new Order({
            quotationId,
            buyerId: req.user._id,
            vendorId: quotation.vendorId,
            totalAmount: quotation.totalAmount,
            paymentMethod: paymentMethod || 'cod',
            paymentStatus: 'pending',
            deliveryStatus: 'pending',
        });

        const createdOrder = await order.save();

        // Close the list and mark quotation as accepted
        list.status = 'closed';
        await list.save();

        quotation.status = 'accepted';
        await quotation.save();

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getOrders = async (req, res) => {
    try {
        let orders;
        if (req.user.role === 'buyer') {
            orders = await Order.find({ buyerId: req.user._id })
                .populate('vendorId', 'name email phone')
                .populate({
                    path: 'quotationId',
                    populate: [
                        { path: 'originalListId' },
                        { path: 'prices.product', select: 'image brand' }
                    ]
                })
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'vendor') {
            orders = await Order.find({ vendorId: req.user._id })
                .populate('buyerId', 'name email phone address')
                .populate({
                    path: 'quotationId',
                    populate: [
                        { path: 'originalListId' },
                        { path: 'prices.product', select: 'image brand' }
                    ]
                })
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'admin') {
            orders = await Order.find({})
                .populate('buyerId', 'name email phone address')
                .populate('vendorId', 'name email phone')
                .populate({
                    path: 'quotationId',
                    populate: [
                        { path: 'originalListId', populate: { path: 'items.product', model: 'Product' } },
                        { path: 'prices.product', select: 'image brand' }
                    ]
                })
                .sort({ createdAt: -1 });
        }
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.buyerId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized' });
            }

            order.paymentStatus = 'paid';

            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const { status } = req.body;

    try {
        const order = await Order.findById(req.params.id);

        if (order) {
            // Verify vendor owns the order
            if (order.vendorId.toString() !== req.user._id.toString()) {
                return res.status(403).json({ message: 'Not authorized to update this order' });
            }

            order.deliveryStatus = status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const trackOrder = async (req, res) => {
    const orderId = req.params.id;
    console.log(`[DEBUG] Tracking attempt for ID: ${orderId} by user: ${req.user._id}`);
    try {
        const order = await Order.findById(orderId)
            .populate('vendorId', 'name')
            .populate('buyerId', 'name');

        if (!order) {
            console.log(`[DEBUG] Order ${orderId} NOT FOUND in DB`);
            return res.status(404).json({ message: 'Order not found' });
        }

        console.log(`[DEBUG] Order ${orderId} found. Status: ${order.deliveryStatus}`);

        // Check if user is the buyer, vendor or admin
        if (req.user.role !== 'admin' &&
            order.buyerId._id.toString() !== req.user._id.toString() &&
            order.vendorId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to track this order' });
        }

        res.json({
            _id: order._id,
            deliveryStatus: order.deliveryStatus,
            paymentStatus: order.paymentStatus,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            vendorName: order.vendorId.name
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createOrder,
    getOrders,
    updateOrderToPaid,
    updateOrderStatus,
    trackOrder
};
