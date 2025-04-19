import app from './app';
import connectDB from './config/db';
import dotenv from 'dotenv';

dotenv.config(); // Ensure env vars are loaded

const PORT = process.env.PORT || 5000;

// Connect to Database and then start server
const startServer = async () => {
    try {
        await connectDB(); // Establish database connection

        const server = app.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
        });

        // Handle Unhandled Promise Rejections (e.g., DB connection fails after initial start)
        process.on('unhandledRejection', (err: Error) => {
            console.error('UNHANDLED REJECTION! 💥 Shutting down...');
            console.error(err.name, err.message);
            server.close(() => { // Gracefully close server before exiting
                process.exit(1);
            });
        });

        // Handle SIGTERM (e.g., from Heroku)
        process.on('SIGTERM', () => {
            console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
            server.close(() => {
                console.log('💥 Process terminated!');
                // Mongoose connection closed automatically on process exit
                process.exit(0);
            });
        });


    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();

// Handle Uncaught Exceptions (Sync code errors) - Place early if needed
process.on('uncaughtException', (err: Error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    console.error(err.stack);
    process.exit(1); // Exit immediately as the process state is unclean
});