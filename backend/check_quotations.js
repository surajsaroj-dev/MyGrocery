const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Quotation = require('./models/Quotation');
require('./models/User'); // Required for populate

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const checkQuotations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const quotations = await Quotation.find({})
            .populate('vendorId', 'name phone')
            .lean();

        console.log('--- QUOTATIONS DATA ---');
        quotations.forEach(q => {
            console.log(`ID: ${q._id}`);
            console.log(`Vendor: ${q.vendorId?.name} (Phone: ${q.vendorId?.phone})`);
            console.log(`Total: ${q.totalAmount}`);
            console.log('-----------------------------');
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkQuotations();
