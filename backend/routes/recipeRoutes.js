import express from 'express';
import {
  generateAiRecipe,
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  toggleFavoriteRecipe,
  toggleLikeRecipe,
} from '../controllers/recipeController.js';
import {
  generateRecipeValidator,
  createRecipeValidator,
  mongoIdValidator,
} from '../validators/recipeValidators.js';
import { protect, optionalProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public recipe browsing
router.get('/', optionalProtect, getRecipes);
router.get('/:id', optionalProtect, mongoIdValidator, getRecipeById);

// Protected recipe generation & CRUD
router.post('/generate', protect, generateRecipeValidator, generateAiRecipe);
router.post('/', protect, createRecipeValidator, createRecipe);
router.put('/:id', protect, mongoIdValidator, createRecipeValidator, updateRecipe);
router.delete('/:id', protect, mongoIdValidator, deleteRecipe);

// Likes & Bookmarks (Private)
router.post('/:id/favorite', protect, mongoIdValidator, toggleFavoriteRecipe);
router.post('/:id/like', protect, mongoIdValidator, toggleLikeRecipe);

export default router;
