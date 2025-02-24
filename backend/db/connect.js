const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');
const User = require('./models/User.js');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // const adminPassword = process.env.ADMIN_PASS;

        // if (!adminPassword) {
        //     throw new Error('Admin password is missing in environment variables');
        // }

        // const allowedCharsRegex = /^[A-Za-z\d@$!%*?&]+$/;

        // if (adminPassword.length < 10) {
        //     throw new Error('Admin password must be at least 10 characters long');
        // }

        // if (!allowedCharsRegex.test(adminPassword)) {
        //     throw new Error('Admin password can only contain letters, numbers, and the special characters @$!%*?&');
        // }

        // const salt = await bcrypt.genSalt(10);
        // const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // await User.findOneAndUpdate(
        //     { username: 'admin' },
        //     { name: 'Admin', password: hashedPassword, username: 'admin' },
        //     { upsert: true, new: true, setDefaultsOnInsert: true }
        // );

        // console.log('Admin access configured successfully');

    } catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
