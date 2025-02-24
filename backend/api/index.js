const express = require('express');


// public routes
const authRoutes = require('./public/authRoutes');
const helperRoutes = require('./public/helperRoutes');

// protected routes
const profileRoutes = require('./protected/profileRoutes');
const dataRoutes = require('./protected/dataRoutes');

// middlewares
const authMiddleware = require('../middlewares/authMiddlewares');

const router = express.Router();

// public
router.use('/auth', authRoutes);
router.use('/', helperRoutes);

// protected
router.use('/profile', authMiddleware, profileRoutes);
router.use('/data', authMiddleware, dataRoutes);

module.exports = router;


