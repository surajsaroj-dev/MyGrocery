const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const checkAdmin = async () => {
    try {
        const admin = await User.findOne({ email: 'admin@example.com' });
        if (admin) {
            console.log('Admin found');
        } else {
            console.log('Admin not found');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkAdmin();
