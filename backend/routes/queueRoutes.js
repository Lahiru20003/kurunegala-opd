const express = require('express');
const router = express.Router();

// Importing all controllers correctly
const { 
    generateToken, 
    getQueue, 
    updateStatus, 
    getMyQueue, 
    getAvailableClinics, 
    createClinic, 
    updatePatientProfile,
    getPendingVerifications, 
    getClinicQueue, 
    verifyPatient, 
    rejectPatient,
    getPatientProfile,
    cancelClinic //Newly added Clinic Cancel Function
} = require('../controllers/queueController');

// --- GET Routes  ---
router.get('/clinics', getAvailableClinics); 
router.get('/my-tokens/:patientId', getMyQueue); 
router.get('/clinic-queue/:clinicId', getClinicQueue); 
router.get('/pending-verifications', getPendingVerifications); 
router.get('/profile/:patientId', getPatientProfile); 
router.get('/', getQueue); 

// --- POST Routes ---
router.post('/generate-token', generateToken);
router.post('/clinics', createClinic); 

// --- PUT Routes  ---
router.put('/clinics/:id/cancel', cancelClinic); // අලුත් Route එක (Clinic Cancel)
router.put('/verify-patient/:id', verifyPatient); 
router.put('/reject-patient/:id', rejectPatient); 
router.put('/profile/:patientId', updatePatientProfile);
router.put('/:id', updateStatus); 

module.exports = router;