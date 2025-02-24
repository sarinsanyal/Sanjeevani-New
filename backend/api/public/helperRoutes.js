const express = require('express');
const User = require('../../db/models/User');
const router = express.Router();

router.get('/whoami', async (req, res) => {
    if (req.session && req.session.user) {
        const existingUser = await User.findOne({ username: req.session.user.username });
        return res.status(200).json({
            loggedIn: true,
            user: existingUser
        });
    }
    return res.status(200).json({
        loggedIn: false,
        user: null
    });
});

router.get('/username', async (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        // Check if the username exists in the database
        const existingUser = await User.findOne({ username: username });

        if (!existingUser) {
            // Username is available
            return res.status(200).json({ available: true, message: 'Username is available' });
        } else {
            // Username is already taken
            return res.status(409).json({ available: false, message: 'Username is already taken' });
        }
    } catch (error) {
        console.error("Error checking username:", error);
        return res.status(500).json({ available: false, message: 'Error checking username' });
    }
});


module.exports = router;
