const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const creditWallets = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected...');

        const users = await User.find({});
        console.log(`Found ${users.length} users. Crediting ₹500 to each...`);

        for (const user of users) {
            user.walletBalance += 500;
            await user.save();

            await Transaction.create({
                userId: user._id,
                amount: 500,
                type: 'deposit',
                status: 'completed',
                description: 'Demo Credit (Initial Testing)',
            });
        }

        console.log('Successfully credited all wallets!');
        process.exit();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
};

creditWallets();
