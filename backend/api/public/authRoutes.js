const express = require('express');
const User = require('../../db/models/User');

const router = express.Router();
const randomPFPs = [
    "https://i.ibb.co/Vtv8pJM/notion-avatar-1734263349216.png",
    "https://i.ibb.co/Dzv4Y0f/notion-avatar-1734263083425.png",
    "https://i.ibb.co/x8WVSt4/notion-avatar-1734263470907.png",
    "https://i.ibb.co/1K77SBC/notion-avatar-1734263518113.png"
]


router.post('/register', async (req, res) => {
    let { userType, name, username, password, age, totalBeds, emptyBeds } = req.body;

    name = name.trim();
    username = username.trim();
    password = password.trim();

    if (!userType || !['patient', 'hospital'].includes(userType)) {
        return res.status(400).json({ message: 'User type is required and must be patient or hospital.' });
    }

    if (!name || !username || !password) {
        return res.status(400).json({ message: 'Name, username, and password are required' });
    }

    if (userType === 'patient' && !age) {
        return res.status(400).json({ message: 'Age is required for patients.' });
    }

    if (userType === 'hospital' && (!totalBeds || !emptyBeds)) {
        return res.status(400).json({ message: 'Total beds and empty beds are required for hospitals.' });
    }

    // No need a validation for name
    // const nameRegex = /^[A-Za-z]+(\s[A-Za-z]+)*$/;
    // if (!nameRegex.test(name)) {
    //     return res.status(400).json({ message: 'Name must contain only English letters and spaces.' });
    // }

    if (name.length > 100) {
        return res.status(400).json({ message: 'Name must be 100 characters or less.' });
    }

    const usernameRegex = /^[A-Za-z0-9_.]+$/;
    if (username.length < 4) {
        return res.status(400).json({ message: 'Username must be at least 4 characters.' });
    }
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ message: 'Username must contain only letters, numbers, _ or .' });
    }

    const passwordRegex = /^[A-Za-z\d@$!%*?&]+$/;
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password can only contain letters, numbers, and the special characters @$!%*?&.' });
    }


    if (userType === 'patient') {
        const ageNumber = parseInt(age, 10);
        if (isNaN(ageNumber) || ageNumber <= 0 || ageNumber > 120) {
            return res.status(400).json({ message: 'Age must be a valid number between 1 and 120.' });
        }
    }

    if (userType === 'hospital') {
        const totalBedsNumber = parseInt(totalBeds, 10);
        const emptyBedsNumber = parseInt(emptyBeds, 10);

        if (isNaN(totalBedsNumber) || totalBedsNumber <= 0) {
            return res.status(400).json({ message: 'Total beds must be a valid number greater than 0.' });
        }
        if (isNaN(emptyBedsNumber) || emptyBedsNumber < 0) {
            return res.status(400).json({ message: 'Empty beds must be a valid number greater than or equal to 0.' });
        }
        if (emptyBedsNumber > totalBedsNumber) {
            return res.status(400).json({ message: 'Empty beds cannot be greater than total beds.' });
        }
    }


    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        let avatar = randomPFPs[Math.floor(Math.random() * randomPFPs.length)];

        const newUser = new User({
            userType,
            name,
            username,
            password,
            ...(userType === 'patient' ? { age } : { totalBeds, emptyBeds }),
            avatar //everyone has avatar
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: 'Something went wrong' });
    }
});



router.post('/login', async (req, res) => {
    let { username, password } = req.body;
    username = username.trim();
    password = password.trim();

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const usernameRegex = /^[A-Za-z0-9_.]+$/;
    if (username.length < 4) {
        return res.status(400).json({ message: 'Username must be at least 4 characters.' });
    }
    if (!usernameRegex.test(username)) {
        return res.status(400).json({ message: 'Username must contain only letters, numbers, _ or .' });
    }

    const passwordRegex = /^[A-Za-z\d@$!%*?&]+$/;
    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Password can only contain letters, numbers, and the special characters @$!%*?&.' });
    }


    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Username not found.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Wrong password!' });
        }

        req.session.user = user;
        // req.session.user = {
        //     userType: user.userType,
        //     name: user.name,
        //     age: user.age,
        //     totalBeds: user.totalBeds,
        //     emptyBeds: user.emptyBeds,
        //     username: user.username,
        //     avatar: user.avatar,
        //     state: user.state,
        //     to: user.to,
        //     requests: user.requests,
        //     admits: user.admits,
        // };

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({ message: "Something went wrong" });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out' });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
});

module.exports = router;
