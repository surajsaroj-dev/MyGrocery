const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const checkLogin = async () => {
    try {
        const email = 'admin@example.com';
        const password = '123456';

        console.log(`Checking login for ${email} with password ${password}...`);

        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found in DB!');
            process.exit(1);
        }

        console.log('User found in DB. Checking password...');

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            console.log('SUCCESS: Password matches!');
        } else {
            console.log('FAILURE: Password does NOT match!');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkLogin();
