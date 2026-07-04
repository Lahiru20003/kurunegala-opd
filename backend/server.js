const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// WhatsApp සඳහා අවශ්‍ය Packages
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ==========================================
// WhatsApp Setup
// ==========================================
const whatsappClient = new Client({
    authStrategy: new LocalAuth(), 
    puppeteer: {
        executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// QR Code එක Terminal එකේ පෙන්වීම
whatsappClient.on('qr', (qr) => {
    console.log('\n--- කරුණාකර ඔබගේ WhatsApp මගින් මෙම QR Code එක Scan කරන්න ---');
    qrcode.generate(qr, { small: true });
});

// WhatsApp සම්බන්ධ වූ පසු
whatsappClient.on('ready', () => {
    console.log('WhatsApp Client is ready and connected!');
});

// WhatsApp Client එක ආරම්භ කිරීම
whatsappClient.initialize();

// වෙනත් ෆයිල් වලදී මැසේජ් යවන්න පුළුවන් වෙන්න මේක app එකට සම්බන්ධ කිරීම
app.locals.whatsappClient = whatsappClient;
// ==========================================

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const queueRoutes = require('./routes/queueRoutes');
app.use('/api/queue', queueRoutes);
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// Basic test route
app.get('/', (req, res) => {
    res.send('OPD Queue Management API is running...');
});

// මෙන්න මේ පේළිය තමයි කලින් ෆයිල් එකේ දෙපාරක් තිබිලා තියෙන්නේ
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});