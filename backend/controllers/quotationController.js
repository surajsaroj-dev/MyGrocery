const Quotation = require('../models/Quotation');
const GroceryList = require('../models/GroceryList');
const User = require('../models/User');

// @desc    Create a new quotation
// @route   POST /api/quotations
// @access  Private (Vendor)
const createQuotation = async (req, res) => {
    const { listId, prices, validUntil } = req.body;

    console.log('--- NEW QUOTATION SUBMISSION ---');
    console.log('listId:', listId);
    console.log('Received Prices:', JSON.stringify(prices, null, 2));

    try {
        const list = await GroceryList.findById(listId);
        if (!list) {
            return res.status(404).json({ message: 'Grocery list not found' });
        }

        if (list.status !== 'open') {
            return res.status(400).json({ message: 'This list is no longer accepting quotes' });
        }

        // Calculate totals and validate inputs
        let totalAmount = 0;
        let discountTotal = 0;

        const processedPrices = [];
        for (const item of prices) {
            const base = parseFloat(item.basePrice);
            const discPercent = parseFloat(item.discount || 0);

            if (isNaN(base)) {
                console.error(`ERROR: Base price is NaN for item: ${item.itemName}`);
                return res.status(400).json({ message: `Invalid base price for item: ${item.itemName}` });
            }

            const safeDisc = isNaN(discPercent) ? 0 : discPercent;
            const final = base - (base * (safeDisc / 100));

            if (isNaN(final)) {
                console.error(`ERROR: Calculated final price is NaN for item: ${item.itemName}`);
                return res.status(400).json({ message: `Failed to calculate final price for item: ${item.itemName}` });
            }

            totalAmount += final;
            discountTotal += (base - final);

            processedPrices.push({
                product: item.product, // Link to master product
                itemName: item.itemName,
                basePrice: base,
                discount: safeDisc,
                finalPrice: final
            });
        }

        console.log('Processed Prices for Mongo:', JSON.stringify(processedPrices, null, 2));
        console.log('calculated totalAmount:', totalAmount);

        if (isNaN(totalAmount)) {
            return res.status(400).json({ message: 'Total amount calculation failed (NaN)' });
        }

        const quotationData = {
            originalListId: listId,
            vendorId: req.user._id,
            prices: processedPrices,
            totalAmount: Number(totalAmount.toFixed(2)), // Store as Number
            discountTotal: Number(discountTotal.toFixed(2)),
            validUntil: validUntil || undefined,
        };

        console.log('Quotation Data to save:', JSON.stringify(quotationData, null, 2));

        const quotation = new Quotation(quotationData);

        // --- REVENUE MODEL: Bidding Charge Deduction ---
        const BIDDING_CHARGE = 5; // e.g., 5 INR per offer
        const vendor = await User.findById(req.user._id);

        if (vendor.walletBalance < BIDDING_CHARGE) {
            return res.status(400).json({ message: `Insufficient wallet balance. Bidding charge is ${BIDDING_CHARGE} INR.` });
        }

        const createdQuotation = await quotation.save();
        await createdQuotation.populate('vendorId', 'name phone');

        // Deduct balance and record transaction
        vendor.walletBalance -= BIDDING_CHARGE;
        await vendor.save();

        const Transaction = require('../models/Transaction');
        await Transaction.create({
            userId: vendor._id,
            amount: BIDDING_CHARGE,
            type: 'bidding_charge',
            status: 'completed',
            description: `Offer submission charge for list: ${list.title}`,
            referenceId: createdQuotation._id
        });

        // Emit socket event for the specific buyer
        const io = req.app.get('socketio');
        if (io) {
            io.to(list.buyerId.toString()).emit('new_quote', {
                quotation: createdQuotation,
                listId: list._id
            });
        }

        res.status(201).json(createdQuotation);
    } catch (error) {
        console.error('CRITICAL SERVER ERROR IN createQuotation:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get quotations
// @route   GET /api/quotations
// @access  Private
const getQuotations = async (req, res) => {
    try {
        let quotations;

        if (req.user.role === 'vendor') {
            // Vendor sees their own quotations
            quotations = await Quotation.find({ vendorId: req.user._id })
                .populate('originalListId', 'title')
                .populate('prices.product', 'image brand') // Populate master data
                .sort({ createdAt: -1 });
        } else if (req.user.role === 'buyer') {
            // Buyer sees quotations for their lists
            if (req.query.listId) {
                // Check if list belongs to buyer
                const list = await GroceryList.findById(req.query.listId);
                if (list && list.buyerId.toString() === req.user._id.toString()) {
                    quotations = await Quotation.find({ originalListId: req.query.listId })
                        .populate('vendorId', 'name phone')
                        .populate('prices.product', 'image brand') // Populate master data
                        .sort({ totalAmount: 1 });
                } else {
                    return res.status(403).json({ message: 'Not authorized' });
                }
            } else {
                const buyerLists = await GroceryList.find({ buyerId: req.user._id }).select('_id');
                const listIds = buyerLists.map(l => l._id);
                quotations = await Quotation.find({ originalListId: { $in: listIds } })
                    .populate('vendorId', 'name phone')
                    .populate('originalListId', 'title')
                    .populate('prices.product', 'image brand') // Populate master data
                    .sort({ createdAt: -1 });
            }
        } else if (req.user.role === 'admin') {
            quotations = await Quotation.find({})
                .populate('vendorId', 'name')
                .populate('prices.product', 'image brand');
        }

        res.json(quotations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createQuotation,
    getQuotations,
};
