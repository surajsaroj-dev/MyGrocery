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

        console.log('COUNT_TOTAL=' + total);
        console.log('COUNT_ACTIVE=' + active);
        console.log('COUNT_BUYERS=' + buyers);
        console.log('COUNT_VENDORS=' + vendors);
        console.log('COUNT_ADMINS=' + admins);

        await mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
