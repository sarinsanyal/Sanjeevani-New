const express = require('express');
const multer = require('multer');
const User = require('../../db/models/User');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpg|jpeg|png|gif|webp/;
        const isValid = allowedTypes.test(file.mimetype);
        if (isValid) {
            cb(null, true);
        } else {
            cb(null, true);
            req.fileValidationError = 'Unsupported file type';
        }
    }
});

router.put('/newavatar', upload.single('avatar'), async (req, res) => {
    if (req.fileValidationError) {
        return res.status(404).json({ message: req.fileValidationError });
    }

    try {
        const username = req.session.user.username;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No image file found' });
        }

        const base64Image = req.file.buffer.toString('base64');
        const imageType = req.file.mimetype;
        const avatarString = `data:${imageType};base64,${base64Image}`;

        user.avatar = avatarString;
        await user.save();

        req.session.user.avatar = user.avatar; // Update avatar in session
        res.status(200).json({ message: 'Avatar updated successfully', user: req.session.user });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Something went wrong' });
    }
});


module.exports = router;
