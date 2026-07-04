const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    avgTimePerPatient: { type: Number, default: 10 },
    maxTokens: { type: Number, default: 50 },
    // Active or Cancelled
    status: { type: String, enum: ['Active', 'Cancelled'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('Clinic', clinicSchema);