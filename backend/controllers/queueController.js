const User = require('../models/User');
const Token = require('../models/Token');
const Clinic = require('../models/Clinic');
const calculatePriority = require('../utils/priorityCalculator');
const moment = require('moment');

// =====================================================================
// WhatsApp Message Templates (භාෂා 3ම එකම පණිවිඩයකට අන්තර්ගත කර ඇත)
// =====================================================================
const getMessageTemplates = (name, clinicName, tokenNum, time) => {
    return {
        booking: `🏥 OPD - Kurunegala Teaching Hospital\n\nආයුබෝවන් / Hello / வணக்கம் ${name},\n\n✅ ඔබගේ වෙන්කරවා ගැනීම සාර්ථකයි.\n✅ Your booking is successful.\n✅ உங்கள் முன்பதிவு வெற்றிகரமாக முடிந்தது.\n\n📍 සායනය / Clinic / கிளினிக்: ${clinicName}\n🔢 අංකය / Token / டோக்கன்: #${tokenNum}\n⏰ වේලාව / Time / நேரம்: ${time}\n\n⚠️ මෙම කාලය පෙර දින සවස 5.00 වන තෙක් වෙනස් වීමට ඉඩ ඇත.\n⚠️ This allocated time is subject to change until 5:00 PM the day before.\n⚠️ ஒதுக்கப்பட்ட நேரம் முந்தைய நாள் மாலை 5:00 மணி வரை மாற்றத்திற்கு உட்பட்டது.\n\nස්තූතියි! / Thank you! / நன்றி!`,
        
        reminder: `🔔 සිහිකැඳවීමයි! / Reminder! / நினைவூட்டல்!\n\nආයුබෝවන් / Hello / வணக்கம் ${name},\n\n⏰ ඔබගේ සායනය සඳහා තව ඇත්තේ පැය 1කි. කරුණාකර ${time} වන විට පැමිණෙන්න.\n⏰ Your clinic is in 1 hour. Please arrive by ${time}.\n⏰ உங்கள் கிளினிக் இன்னும் 1 மணிநேரத்தில் உள்ளது. தயவுசெய்து ${time} க்குள் வரவும்.`,
        
        cancellation: `🚫 සායනය අවලංගු කිරීමයි! / Clinic Cancelled! / கிளினிக் ரத்து!\n\nආයුබෝවන් / Hello / வணக்கம் ${name},\n\n⚠️ හදිසි හේතුවක් මත ඔබගේ අද දින සායනය (${clinicName}) අවලංගු කර ඇත.\n⚠️ Due to an emergency, your scheduled clinic (${clinicName}) has been cancelled.\n⚠️ அவசர நிலை காரணமாக உங்களின் (${clinicName}) கிளினிக் ரத்து செய்யப்பட்டுள்ளது.\n\nකරුණාකර නව වේලාවක් වෙන්කරවා ගන්න. / Please rebook. / மீண்டும் முன்பதிவு செய்யவும்.`
    };
};
// =====================================================================

// 1. Generate Token (Book Clinic)
exports.generateToken = async (req, res) => {
    try {
        const { patientId, clinicId } = req.body;
        const patient = await User.findById(patientId);
        const clinic = await Clinic.findById(clinicId);

        if (!patient || !clinic) return res.status(404).json({ success: false, message: 'Invalid Patient or Clinic' });

        const existingToken = await Token.findOne({ patientId, clinicId });
        if (existingToken) return res.status(400).json({ success: false, message: 'You have already booked this specific clinic session.' });

        if (patient.specialNeedsCategory !== 'None' && (patient.specialNeedsStatus === 'Pending' || patient.specialNeedsStatus === 'Rejected')) {
            const firstToken = await Token.findOne({ patientId }).populate('clinicId').sort({ createdAt: 1 });
            if (firstToken && firstToken.clinicId) {
                const firstDate = new Date(firstToken.clinicId.date).toDateString();
                const newDate = new Date(clinic.date).toDateString();
                if (firstDate !== newDate) {
                    return res.status(403).json({ success: false, message: "Your special needs request is pending or rejected. Please update your profile to 'Normal' or verify with admin." });
                }
            }
        }
        
        const currentTokenCount = await Token.countDocuments({ clinicId, status: { $in: ['Pending', 'Active', 'Completed', 'Skipped'] }});
        if (currentTokenCount >= clinic.maxTokens) return res.status(400).json({ success: false, message: 'Clinic is fully booked!' });

        const priorityScore = calculatePriority(patient.dob, patient.specialNeedsCategory);
        const lockTime = moment(clinic.date).clone().subtract(1, 'days').set({ hour: 17, minute: 0, second: 0 });
        let isSystemLocked = moment().isAfter(lockTime);

        const newToken = new Token({ patientId: patient._id, clinicId: clinic._id, tokenNumber: currentTokenCount + 1, priorityScore, assignedTime: "Calculating...", status: 'Pending' });
        await newToken.save();

        let allTokens = await Token.find({ clinicId, status: 'Pending' });
        if (!isSystemLocked) {
            allTokens.sort((a, b) => b.priorityScore - a.priorityScore);
        } else {
            allTokens.sort((a, b) => a.tokenNumber - b.tokenNumber);
        }

        let currentTime = moment(clinic.startTime, "HH:mm");
        for (let token of allTokens) {
            token.assignedTime = currentTime.format("HH:mm");
            await token.save();
            currentTime.add(clinic.avgTimePerPatient, 'minutes');
        }
        const finalToken = await Token.findById(newToken._id);

        // ====================================================================
        // WHATSAPP ADVANCED NOTIFICATION SYSTEM 
        // ====================================================================
        try {
            const whatsappClient = req.app.locals.whatsappClient;
            
            if (whatsappClient && patient.mobileNumber) {
                let mobile = patient.mobileNumber.toString().trim();
                if (mobile.startsWith('0')) {
                    mobile = '94' + mobile.substring(1);
                }
                const chatId = mobile + "@c.us";
                
                // කෙළින්ම මැසේජ් ටෙම්ප්ලේට් එක ලබා ගැනීම (භාෂා තේරීමක් නැත)
                const msgs = getMessageTemplates(patient.name, clinic.name, finalToken.tokenNumber, finalToken.assignedTime);

                // 1. වෙන්කරගත් වහාම යවන පණිවිඩය
                whatsappClient.sendMessage(chatId, msgs.booking)
                    .then(() => console.log(`[WhatsApp] Trilingual Booking msg sent to ${patient.name}`))
                    .catch(err => console.error('[WhatsApp] Send failed:', err.message));

                // 2. පැයකට පෙර සිහිකැඳවීම යැවීමේ ක්‍රියාවලිය
                const clinicDate = moment(clinic.date).format('YYYY-MM-DD');
                const appointmentTime = moment(`${clinicDate} ${finalToken.assignedTime}`, 'YYYY-MM-DD HH:mm');
                const reminderTime = appointmentTime.clone().subtract(1, 'hours');
                const now = moment();
                const delayUntilReminder = reminderTime.diff(now);

                if (delayUntilReminder > 0) {
                    setTimeout(() => {
                        whatsappClient.sendMessage(chatId, msgs.reminder)
                            .then(() => console.log(`[WhatsApp] Trilingual 1-Hour Reminder sent to ${patient.name}`))
                            .catch(err => console.error('[WhatsApp] Reminder failed:', err.message));
                    }, delayUntilReminder);
                }
            }
        } catch (waError) {
            console.error('[WhatsApp] Error:', waError.message);
        }
        // ====================================================================

        res.status(201).json({ success: true, token: finalToken, message: "Slot Allocated." });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 2. Get Queue (General)
exports.getQueue = async (req, res) => {
    try {
        const tokens = await Token.find({ status: 'Pending' }).populate('patientId').populate('clinicId');
        res.status(200).json({ success: true, data: tokens });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 3. Update Status (Call/Complete)
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params; const { status } = req.body;
        const token = await Token.findByIdAndUpdate(id, { status }, { new: true });
        res.status(200).json({ success: true, data: token });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 4. Get My Queue (Patient Dashboard Queue) 
exports.getMyQueue = async (req, res) => {
    try {
        const myTokens = await Token.find({ patientId: req.params.patientId, status: { $in: ['Pending', 'Active'] } }).populate('clinicId');
        const now = moment();

        const validTokens = myTokens.filter(token => {
            if (!token.clinicId) return false; 
            if (token.clinicId.status === 'Cancelled') return false; 
            const clinicDate = moment(token.clinicId.date).format('YYYY-MM-DD');
            const clinicEndTime = moment(`${clinicDate} ${token.clinicId.endTime}`, 'YYYY-MM-DD HH:mm');
            return now.isBefore(clinicEndTime);
        });

        const liveQueueData = await Promise.all(validTokens.map(async (myToken) => {
            const activeToken = await Token.findOne({ clinicId: myToken.clinicId._id, status: 'Active' });
            const peopleAhead = await Token.countDocuments({ clinicId: myToken.clinicId._id, status: 'Pending', priorityScore: { $gte: myToken.priorityScore }, _id: { $ne: myToken._id } });
            return { ...myToken._doc, currentlyCalling: activeToken ? activeToken.tokenNumber : 'None', peopleAhead, isNext: peopleAhead === 0 && myToken.status === 'Pending' };
        }));
        
        res.status(200).json({ success: true, data: liveQueueData });
    } catch (error) { 
        res.status(500).json({ success: false, message: error.message }); 
    }
};

// 5. Get Available Clinics (Time filtered)
exports.getAvailableClinics = async (req, res) => {
    try {
        const allFutureClinics = await Clinic.find({ date: { $gte: new Date().setHours(0,0,0,0) } });
        const now = moment();
        const availableClinics = allFutureClinics.filter(clinic => now.isBefore(moment(`${moment(clinic.date).format('YYYY-MM-DD')} ${clinic.endTime}`, 'YYYY-MM-DD HH:mm')));
        res.status(200).json({ success: true, data: availableClinics });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 6. Create Clinic
exports.createClinic = async (req, res) => {
    try {
        const newClinic = await Clinic.create(req.body);
        res.status(201).json({ success: true, data: newClinic });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 7. Update Patient Profile
exports.updatePatientProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.patientId);
        user.specialNeedsCategory = req.body.specialNeedsCategory;
        user.specialNeedsStatus = req.body.specialNeedsCategory === 'None' ? 'Not Applicable' : 'Pending';
        await user.save();
        res.status(200).json({ success: true, user });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 8. Get Pending Verifications
exports.getPendingVerifications = async (req, res) => {
    try {
        const pendingUsers = await User.find({ specialNeedsStatus: 'Pending' }).select('-password');
        res.status(200).json({ success: true, data: pendingUsers });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 9. Get Clinic Queue (Admin Table)
exports.getClinicQueue = async (req, res) => {
    try {
        const queue = await Token.find({ clinicId: req.params.clinicId })
            .populate('patientId', 'name nic mobileNumber specialNeedsCategory specialNeedsStatus')
            .sort({ tokenNumber: 1 });
        res.status(200).json({ success: true, data: queue });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 10. Verify Patient
exports.verifyPatient = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { specialNeedsStatus: 'Verified' });
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 11. Reject Patient
exports.rejectPatient = async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, { specialNeedsStatus: 'Rejected' });
        res.status(200).json({ success: true });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 12. Patient Profile Live Sync
exports.getPatientProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.patientId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.status(200).json({ success: true, user });
    } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

// 13. Cancel Clinic
exports.cancelClinic = async (req, res) => {
    try {
        const clinic = await Clinic.findByIdAndUpdate(req.params.id, { status: 'Cancelled' }, { new: true });
        if (!clinic) return res.status(404).json({ success: false, message: 'Clinic not found' });

        const affectedTokens = await Token.find({
            clinicId: clinic._id,
            status: { $in: ['Pending', 'Active'] }
        }).populate('patientId');

        // ====================================================================
        // WHATSAPP CANCELLATION NOTIFICATION (Trilingual)
        // ====================================================================
        try {
            const whatsappClient = req.app.locals.whatsappClient;
            
            if (whatsappClient && affectedTokens.length > 0) {
                for (let token of affectedTokens) {
                    const patient = token.patientId;
                    
                    if (patient && patient.mobileNumber) {
                        let mobile = patient.mobileNumber.toString().trim();
                        if (mobile.startsWith('0')) {
                            mobile = '94' + mobile.substring(1);
                        }
                        const chatId = mobile + "@c.us";
                        
                        // කෙළින්ම මැසේජ් ටෙම්ප්ලේට් එක ලබා ගැනීම
                        const msgs = getMessageTemplates(patient.name, clinic.name, token.tokenNumber, token.assignedTime);

                        whatsappClient.sendMessage(chatId, msgs.cancellation)
                            .then(() => console.log(`[WhatsApp] Trilingual Cancellation msg sent to ${patient.name}`))
                            .catch(err => console.error('[WhatsApp] Send failed for cancellation:', err.message));
                    }
                }
            }
        } catch (waError) {
            console.error('[WhatsApp] Error in cancellation messaging:', waError.message);
        }
        // ====================================================================

        res.status(200).json({ success: true, message: 'Clinic cancelled successfully', data: clinic });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};