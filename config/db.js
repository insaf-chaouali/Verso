const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('✅ Connected to MongoDB');
    } catch (err) {
        console.error('❌ Could not connect to MongoDB:', err.message);
        process.exit(1); // Quitte l'application en cas d'erreur
    }
};

module.exports = connectDB;