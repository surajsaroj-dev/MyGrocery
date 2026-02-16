const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const total = await User.countDocuments({});
        const active = await User.countDocuments({ isDeleted: { $ne: true } });
        const buyers = await User.countDocuments({ role: 'buyer', isDeleted: { $ne: true } });
        const vendors = await User.countDocuments({ role: 'vendor', isDeleted: { $ne: true } });
        const admins = await User.countDocuments({ role: 'admin', isDeleted: { $ne: true } });

        console.log('--- DATABASE STATUS ---');
        console.log('Total Users (incl deleted):', total);
        console.log('Active Users (isDeleted != true):', active);
        console.log('Buyers:', buyers);
        console.log('Vendors:', vendors);
        console.log('Admins:', admins);

        const sample = await User.find({ isDeleted: { $ne: true } }).limit(5).select('name email role');
        console.log('--- SAMPLE USERS ---');
        console.log(sample);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
