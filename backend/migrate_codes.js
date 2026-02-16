const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const migrateReferralCodes = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected.');

        const users = await User.find({ referralCode: { $exists: false } });
        console.log(`Found ${users.length} users with missing referral codes.`);

        const usersWithEmpty = await User.find({ referralCode: '' });
        console.log(`Found ${usersWithEmpty.length} users with empty referral codes.`);

        const allToFix = [...users, ...usersWithEmpty];

        for (const user of allToFix) {
            console.log(`Generating code for ${user.email}...`);
            // The pre-save hook will handle it, but we can also do it here if we want to be explicit
            await user.save();
        }

        console.log('Migration completed.');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrateReferralCodes();
