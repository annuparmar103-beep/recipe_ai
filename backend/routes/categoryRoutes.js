import express from 'express';
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { categoryValidator, mongoIdValidator } from '../validators/recipeValidators.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route to list active categories
router.get('/', getCategories);

// Admin-only management routes
router.post('/', protect, authorize('admin'), categoryValidator, createCategory);
router.put('/:id', protect, authorize('admin'), mongoIdValidator, categoryValidator, updateCategory);
router.delete('/:id', protect, authorize('admin'), mongoIdValidator, deleteCategory);

export default router;
