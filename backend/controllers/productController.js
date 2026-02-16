const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: { $ne: true } }).populate('category', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        console.log('--- PRODUCT CREATION DIAGNOSTIC ---');
        console.log('Body:', req.body);
        console.log('File:', req.file);

        const { name, category, brand, unit, description } = req.body;

        if (!name || !category || !unit) {
            console.log('Missing fields:', { name: !!name, category: !!category, unit: !!unit });
            return res.status(400).json({ message: 'Name, Category, and Unit are required' });
        }

        let image = '';
        if (req.file) {
            image = req.file.path.replace(/\\/g, '/');
            console.log('Image path processed:', image);
        }

        const product = await Product.create({
            name,
            category,
            brand,
            unit,
            description,
            image
        });

        console.log('Product created successfully:', product._id);

        const createdProduct = await Product.findById(product._id).populate('category', 'name');
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('CRITICAL PRODUCT CREATION ERROR:', error);
        res.status(500).json({
            message: 'Server error during product creation',
            error: error.message,
            stack: error.stack
        });
    }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            product.isDeleted = true;
            await product.save();
            res.json({ message: 'Product removed' });
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, category, brand, unit, description } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.category = (category && category !== '') ? category : product.category;
            product.brand = brand || product.brand;
            product.unit = unit || product.unit;
            product.description = description || product.description;

            if (req.file) {
                product.image = req.file.path.replace(/\\/g, '/');
            }

            await product.save();
            const updatedProduct = await Product.findById(product._id).populate('category', 'name');
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Product Update Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct
};
