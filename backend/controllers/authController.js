const User = require('../models/User');

// 1. Patient registration
exports.patientRegister = async (req, res) => {
    try {
        const { username, password, name, dob, gender, mobileNumber, specialNeedsCategory, nic, guardianName, guardianNic } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ success: false, message: 'This account username already exists.' });

        if (nic) {
            const existingNic = await User.findOne({ nic });
            if (existingNic) return res.status(400).json({ success: false, message: 'An account with this NIC already exists.' });
        }

        // Pending if there are special needs
        let initialStatus = 'Not Applicable';
        if (specialNeedsCategory !== 'None') {
            initialStatus = 'Pending';
        }

        const newUser = new User({
            username, password, name, dob, gender, mobileNumber, 
            specialNeedsCategory, specialNeedsStatus: initialStatus, 
            nic, guardianName, guardianNic
        });

        await newUser.save();
        res.status(201).json({ success: true, message: 'Registration Successful!', user: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Patient login
exports.patientLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        if (!user) return res.status(404).json({ success: false, message: 'User not found. Please register.' });
        if (user.password !== password) return res.status(401).json({ success: false, message: 'Incorrect Password.' });

        res.status(200).json({ success: true, message: 'Login Successful', user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Admin login
exports.staffLogin = async (req, res) => {
    try {
        const { username, password, adminAccessCode } = req.body;
        // For now, simply log in
        if (username === 'admin' && password === 'admin123') {
            res.status(200).json({ success: true, message: 'Staff Login Successful' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Username or Password!' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};