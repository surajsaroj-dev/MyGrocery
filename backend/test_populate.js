const mongoose = require('mongoose');
const dotenv = require('dotenv');
const GroceryList = require('./models/GroceryList');
require('./models/User'); // Register User model
require('./models/Product'); // Register Product model

dotenv.config();

const testPopulate = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const lists = await GroceryList.find({ status: 'open' })
            .populate('buyerId', 'name phone')
            .populate('items.product', 'name brand unit image')
            .sort({ createdAt: -1 });

        console.log('--- OPEN LISTS POPULATED ---');
        lists.forEach(l => {
            console.log(`List: ${l.title}`);
            console.log(`Buyer Name: ${l.buyerId?.name}`);
            console.log(`Buyer Phone: ${l.buyerId?.phone}`);
            console.log('-----------------------------');
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

testPopulate();
