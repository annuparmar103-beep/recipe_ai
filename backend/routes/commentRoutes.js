import express from 'express';
import {
  addComment,
  getRecipeComments,
  deleteComment,
} from '../controllers/commentController.js';
import {
  commentValidator,
  mongoIdValidator,
  recipeIdValidator,
} from '../validators/recipeValidators.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes to fetch comments
router.get('/recipe/:recipeId', recipeIdValidator, getRecipeComments);

// Protected routes to submit and delete reviews
router.post('/recipe/:recipeId', protect, recipeIdValidator, commentValidator, addComment);
router.delete('/:id', protect, mongoIdValidator, deleteComment);

export default router;
