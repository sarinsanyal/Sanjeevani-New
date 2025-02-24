const express = require('express');
const path = require('path');
const connectDB = require('./db/connect.js');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const MongoStore = require('connect-mongo');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const frontendOutDir = path.join(__dirname, '..', 'frontend', 'dist');

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: false, maxAge: 3600000 }
}));

// Use the routes
const apiRoutes = require('./api');
app.use('/api', apiRoutes);

// Serve static files
app.use(express.static(frontendOutDir));

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'fallback.html'));
});

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Running at: http://127.0.0.1:${PORT}`);
    });
}

console.log("Booting...");
startServer();
