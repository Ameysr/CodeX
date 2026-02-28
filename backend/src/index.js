const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

// Config
const connectDB = require('./config/db');
const redisClient = require('./config/redis');

// Routes
const authRouter = require('./routes/userAuth');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit');
const aiRouter = require('./routes/aiChatting');
const aiAnalysis = require('./routes/aiAnalysis');
const contestRouter = require('./routes/contestCreation');
const dashboardRouter = require('./routes/dashboard');
const interviewRouter = require('./routes/virtualinterview');
const videoRouter = require('./routes/videoCreator');
const promoRouter = require('./routes/promoRoutes');
const blogRoutes = require('./routes/blogRoutes');
const picRouter = require('./routes/profileRoutes');

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// ── Health check ───────────────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// ── Routes ─────────────────────────────────────────────────
app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/analysis', aiAnalysis);
app.use('/contest', contestRouter);
app.use('/dashboard', dashboardRouter);
app.use('/interview', interviewRouter);
app.use('/video', videoRouter);
app.use('/userPromo', promoRouter);
app.use('/blog', blogRoutes);
app.use('/profile', picRouter);

// ── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// ── Centralized error handler (MUST be last) ───────────────
app.use(errorHandler);

// ── Start server ───────────────────────────────────────────
const initializeConnection = async () => {
    try {
        await Promise.all([connectDB(), redisClient.connect()]);
        console.log('✓ MongoDB connected');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`✓ Server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error('✗ Startup error:', err.message);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

initializeConnection();
