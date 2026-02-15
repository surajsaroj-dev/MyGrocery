const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({}, 'name email role phone');
        console.log('--- USER LIST ---');
        users.forEach(u => {
            console.log(`${u.role.toUpperCase()}: ${u.name} (${u.email}) - Phone: [${u.phone || 'EMPTY'}]`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
};

checkUsers();
