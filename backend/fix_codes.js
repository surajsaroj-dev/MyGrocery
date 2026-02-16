const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const migrateReferralCodes = async () => {
    try {
        console.log('Connecting to MongoDB...');
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI not found in .env');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const users = await User.find({
            $or: [
                { referralCode: { $exists: false } },
                { referralCode: null },
                { referralCode: '' }
            ]
        });

        console.log(`Found ${users.length} users to update.`);

        for (const user of users) {
            try {
                const code = crypto.randomBytes(4).toString('hex').toUpperCase();
                user.referralCode = code;
                await user.save();
                console.log(`Updated user ${user.email} with code ${code}`);
            } catch (saveError) {
                console.error(`Failed to update user ${user.email}:`, saveError.message);
            }
        }

        console.log('Migration process finished.');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateReferralCodes();
