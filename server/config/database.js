import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // These options are now default in Mongoose 6+
            // but included for clarity and compatibility
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);

        // Enable debug mode in development
        if (process.env.NODE_ENV === 'development') {
            mongoose.set('debug', true);
        }

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error(' MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('MongoDB disconnected');
        });

    } catch (error) {
        console.error(' Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;
