const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Product = require('./models/Product');

const migrateImages = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({ image: { $regex: 'http://localhost' } });
        console.log(`Found ${products.length} products with absolute URLs.`);

        for (let p of products) {
            const oldPath = p.image;
            // Remove up to the last slash of the base URL
            const newPath = p.image.split('5000/')[1];
            if (newPath) {
                p.image = newPath;
                await p.save();
                console.log(`Migrated: ${oldPath} -> ${newPath}`);
            }
        }

        console.log('Migration complete.');
        await mongoose.connection.close();
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrateImages();
