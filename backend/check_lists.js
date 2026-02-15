const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const GroceryList = require('./models/GroceryList');
require('./models/User');

dotenv.config({ path: path.join(__dirname, '.env') });

const checkLists = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const lists = await GroceryList.find({ status: 'open' })
            .populate('buyerId', 'name phone')
            .lean();

        console.log('--- OPEN LISTS DATA ---');
        lists.forEach(l => {
            console.log(`ID: ${l._id}`);
            console.log(`Title: ${l.title}`);
            console.log(`Buyer: ${l.buyerId?.name || 'MISSING'} (Phone: ${l.buyerId?.phone || 'MISSING'})`);
            console.log('-----------------------------');
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkLists();
