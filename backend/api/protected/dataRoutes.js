const express = require('express');
const User = require('../../db/models/User');

const router = express.Router();

router.get('/hospitals', async (req, res) => {
    try {
        const hospitals = await User.find({ userType: 'hospital' }, 'name totalBeds emptyBeds username');
        res.status(200).json(hospitals);
    } catch (error) {
        console.error('Error fetching hospitals:', error);
        res.status(500).json({ message: 'Error fetching hospitals' });
    }
});

router.post('/request', async (req, res) => {
    try {
        const { to } = req.body;

        const hospital = await User.findOne({ username: to, userType: 'hospital' });
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        const user = await User.findOne({ username: req.session.user.username });
        user.state = "pending";
        user.to = to;
        await user.save();
        req.session.user.to = to;
        req.session.user.state = "pending";

        if (!hospital.requests.has(user.username)) {
            hospital.requests.set(user.username, { name: user.name });
            const data = await hospital.save();
            req.session.user.requests = data.requests;
        }

        res.status(200).json({ message: `Request sent successfully to ${hospital.name}` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error processing request" });
    }
});

router.post('/cancel', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.session.user.username });

        const hospital = await User.findOne({ username: user.to, userType: 'hospital' });
        if (hospital && hospital.requests.has(user.username)) {
            hospital.requests.delete(user.username);
            await hospital.save();
        }

        user.state = "";
        user.to = "";
        await user.save();
        delete req.session.user.to;
        delete req.session.user.state;

        res.status(200).json({ message: `Request canceled successfully to ${hospital.name}` });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error canceling request" });
    }
});

router.post('/admit', async (req, res) => {
    try {
        const { who } = req.body;
        const hospitalUsername = req.session.user.username;

        const hospital = await User.findOne({ username: hospitalUsername, userType: 'hospital' });
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        const patient = await User.findOne({ username: who, userType: 'patient' });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        if (!hospital.requests.has(who)) {
            return res.status(400).json({ message: "No pending request from this patient" });
        }


        hospital.admits.set(who, { name: patient.name });
        hospital.requests.delete(who);
        hospital.emptyBeds = Math.max(0, hospital.emptyBeds - 1);
        const data = await hospital.save();

        req.session.user.requests = data.requests;
        req.session.user.admits = data.admits;
        patient.state = "admitted";
        patient.to = hospitalUsername;
        await patient.save();

        res.status(200).json({ message: `User ${who} admitted to ${hospital.name}.`, requests: data.requests, admits: data.admits });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error admitting user" });
    }
});

router.post('/release', async (req, res) => {
    try {
        const { who } = req.body;
        const hospitalUsername = req.session.user.username;

        const hospital = await User.findOne({ username: hospitalUsername, userType: 'hospital' });
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        if (!hospital.admits.has(who)) {
            return res.status(400).json({ message: "Patient not admitted here" });
        }

        const patient = await User.findOne({ username: who, userType: 'patient' });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        hospital.admits.delete(who);
        hospital.emptyBeds += 1;
        const data = await hospital.save();
        req.session.user.admits = data.admits;

        patient.state = "";
        patient.to = "";
        await patient.save();

        // req.session.user.admits = data.admits;

        res.status(200).json({ message: `User ${who} released from ${hospital.name}.`, admits: data.admits });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error releasing user" });
    }
});


router.post('/reject', async (req, res) => {
    try {
        const { who } = req.body;
        const hospitalUsername = req.session.user.username;

        const hospital = await User.findOne({ username: hospitalUsername, userType: 'hospital' });
        if (!hospital) {
            return res.status(404).json({ message: "Hospital not found" });
        }

        const patient = await User.findOne({ username: who, userType: 'patient' });
        if (!patient) {
            return res.status(404).json({ message: "Patient not found" });
        }

        hospital.requests.delete(who);
        const data = await hospital.save();
        req.session.user.requests = data.requests;

        patient.state = "";
        patient.to = "";
        await patient.save();


        res.status(200).json({ message: `User ${who} rejected from ${hospital.name}.`, requests: data.requests });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error releasing user" });
    }
});


module.exports = router;
