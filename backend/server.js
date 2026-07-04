const express = require('express');
const { config } = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// WhatsApp සඳහා අවශ්‍ය Packages
const { Client, LocalAuth } = require('whatsapp-web.js');
const { generate } = require('qrcode-terminal');

// Load environment variables
config();

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

whatsappClient.on('qr', (qr) => {
    console.log('\n--- කරුණාකර ඔබගේ WhatsApp මගින් මෙම QR Code එක Scan කරන්න ---');
    generate(qr, { small: true });
});

whatsappClient.on('ready', () => {
    console.log('WhatsApp Client is ready and connected!');
});

whatsappClient.initialize().catch((error) => {
    console.error('WhatsApp initialization failed:', error.message);
});

app.locals.whatsappClient = whatsappClient;
// ==========================================

// Middleware - මෙතන තමයි වැදගත්ම කොටස
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning']
}));

// Pre-flight requests සඳහා ඉඩ ලබාදීම
app.options(/(.*)/, cors());

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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});