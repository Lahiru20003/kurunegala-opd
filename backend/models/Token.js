const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    tokenNumber: { type: Number, required: true },
    priorityScore: { type: Number, required: true },
    assignedTime: { type: String, required: true }, // The patient should arrive at the right time.
    status: { type: String, enum: ['Pending', 'Active', 'Completed', 'Skipped'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('Token', tokenSchema);