import mongoose from 'mongoose';
import Category from '../models/categoryModel.js';

/**
 * Seed default categories if none exist in the database.
 */
const seedCategories = async () => {
  try {
    const count = await Category.countDocuments();
    if (count === 0) {
      console.log('[Seeder]: No categories found. Seeding initial categories...');
      const defaultCategories = [
        { name: 'Italian', description: 'Classic pasta, pizza, and Italian herbs.', status: 'active' },
        { name: 'Mexican', description: 'Flavorful tacos, burritos, and spicy salsas.', status: 'active' },
        { name: 'Indian', description: 'Rich curries, aromatic spices, and flatbreads.', status: 'active' },
        { name: 'Asian', description: 'Stir-fries, noodles, and savory soy-based dishes.', status: 'active' },
        { name: 'Healthy', description: 'Low-calorie, nutrient-dense, and clean meals.', status: 'active' },
        { name: 'Desserts', description: 'Sweet treats, pastries, and baked goods.', status: 'active' }
      ];
      await Category.insertMany(defaultCategories);
      console.log('[Seeder]: Successfully seeded default categories.');
    }
  } catch (error) {
    console.error(`[Seeder Error]: Failed to seed categories: ${error.message}`);
  }
};

/**
 * Establish connection to MongoDB Atlas or local database instance.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[MongoDB Connected]: Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
    // Run category seeder
    await seedCategories();
  } catch (error) {
    console.error(`[MongoDB Connection Error]: ${error.message}`);
    // Exit process with failure code if database connection fails
    process.exit(1);
  }
};

export default connectDB;
