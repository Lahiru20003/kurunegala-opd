const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    specialNeedsCategory: { type: String, default: 'None' },
    // 'Rejected' has been newly added here.
    specialNeedsStatus: { type: String, enum: ['Not Applicable', 'Pending', 'Verified', 'Rejected'], default: 'Not Applicable' },
    nic: { type: String, default: null }, 
    guardianName: { type: String, default: null }, 
    guardianNic: { type: String, default: null }, 
    profilePic: { type: String, default: '' },
    role: { type: String, default: 'Patient' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);