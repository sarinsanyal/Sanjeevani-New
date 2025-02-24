const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    userType: {
        type: String,
        enum: ['patient', 'hospital'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    age: {  // Only for patients
        type: Number,
        required: function () { return this.userType === 'patient'; },
        min: 0,
        max: 120
    },
    totalBeds: {  // Only for hospitals
        type: Number,
        required: function () { return this.userType === 'hospital'; },
        min: 0
    },
    emptyBeds: {  // Only for hospitals
        type: Number,
        required: function () { return this.userType === 'hospital'; },
        min: 0
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: null
    },
    state: {
        type: String
    },
    to: {
        type: String
    },
    requests: {
        type: Map,
        of: new mongoose.Schema({
            name: { type: String, required: true }
        }, { _id: false }),
        default: {}
    },
    admits: {
        type: Map,
        of: new mongoose.Schema({
            name: { type: String, required: true }
        }, { _id: false }),
        default: {}
    }
});


// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Static method to check username availability
userSchema.statics.checkUsername = async function (username) {
    const user = await this.findOne({ username });
    return !user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
