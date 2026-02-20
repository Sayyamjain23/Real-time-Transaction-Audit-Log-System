import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path'; // <--- ADDED
import { fileURLToPath } from 'url'; // <--- ADDED
import connectDB from './config/database.js';
import routes from './routes/index.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// ========================
// Helper for ES Modules
// ========================
const __filename = fileURLToPath(import.meta.url); // <--- ADDED
const __dirname = path.dirname(__filename);        // <--- ADDED

// ========================
// Middleware
// ========================

// CORS configuration
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        credentials: true, // Allow cookies
    })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Request logging (development only)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ========================
// Routes
// ========================

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use('/api', routes);

// ========================
// Serve Frontend (DEPLOYMENT)
// ========================
if (process.env.NODE_ENV === 'production') {
    // 1. Serve static files from the React build
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // 2. Handle React routing (return index.html for non-API requests)
    app.get('*', (req, res, next) => {
        // If it's an API request that wasn't caught above, pass to 404 handler
        if (req.path.startsWith('/api')) {
            return next();
        }
        res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
    });
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// ========================
// Error Handler
// ========================

app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors,
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
            success: false,
            message: `${field} already exists`,
        });
    }

    // Default error
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

// ========================
// Start Server
// ========================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Start Express server
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 API: http://localhost:${PORT}/api`);
            console.log(`❤️  Health: http://localhost:${PORT}/health\n`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Only start the server when running locally (not on Vercel serverless)
if (process.env.VERCEL !== '1') {
    startServer();
}

// Export app for Vercel serverless runtime
export default app;

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    process.exit(0);
});
