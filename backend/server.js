import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

// Handle Uncaught Exceptions
process.on('uncaughtException', (err) => {
  console.error(`[UNCAUGHT EXCEPTION]: ${err.message}`);
  console.error(err.stack);
  console.log('Shutting down server due to uncaught exception...');
  process.exit(1);
});

// Load environment variables from .env
dotenv.config();

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

// Start Server
const server = app.listen(PORT, () => {
  console.log(`[RecipeAI Server running in ${process.env.NODE_ENV} mode on port ${PORT}]`);
});

// Handle Unhandled Promise Rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`[UNHANDLED REJECTION]: Error: ${err.message}`);
  if (err.stack) console.error(err.stack);
  console.log('Shutting down server due to unhandled promise rejection...');
  server.close(() => {
    process.exit(1);
  });
});
