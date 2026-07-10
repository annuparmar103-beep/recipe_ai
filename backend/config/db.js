import mongoose from 'mongoose';

/**
 * Establish connection to MongoDB Atlas or local database instance.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB Connected]: Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Exit process with failure code if database connection fails
    process.exit(1);
  }
};

export default connectDB;
