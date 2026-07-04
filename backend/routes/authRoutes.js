const express = require('express');
const router = express.Router();

// Importing exactly 3 names
const { patientRegister, patientLogin, staffLogin } = require('../controllers/authController');

// Routes are given exactly those 3 names.
router.post('/register', patientRegister);
router.post('/login', patientLogin);
router.post('/staff-login', staffLogin);

module.exports = router;