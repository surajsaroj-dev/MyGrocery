const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const verifyUsers = async () => {
    try {
        const users = await User.find({});
        console.log('Users in DB:', users.length);
        users.forEach(u => {
            console.log(`- ${u.email} (Role: ${u.role})`);
        });
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

verifyUsers();
