const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isDeleted: false }).populate('category', 'name');
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    const { name, category, brand, unit, description, image } = req.body;

    console.log('Product Creation Body:', req.body);
    console.log('Product Creation File:', req.file);

    let imageUrl = image;
    if (req.file) {
        // Construct URL for the uploaded file
        imageUrl = `http://localhost:5000/${req.file.path.replace(/\\/g, '/')}`;
    }

    try {
        const product = await Product.create({
            name,
            category,
            brand,
            unit,
            description,
            image: imageUrl
        });

        res.status(201).json(product);
    } catch (error) {
        console.error('Product Creation Error:', error);
        res.status(500).json({ message: error.message });
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
            product.category = category || product.category;
            product.brand = brand || product.brand;
            product.unit = unit || product.unit;
            product.description = description || product.description;

            if (req.file) {
                product.image = `http://localhost:5000/${req.file.path.replace(/\\/g, '/')}`;
            }

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    deleteProduct,
    updateProduct
};
