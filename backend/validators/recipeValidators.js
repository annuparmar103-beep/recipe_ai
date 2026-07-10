import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validatorMiddleware.js';

export const generateRecipeValidator = [
  body('ingredients')
    .optional()
    .isArray()
    .withMessage('Ingredients must be an array of strings'),
  body('cuisine')
    .optional()
    .trim()
    .isString(),
  body('mealType')
    .optional()
    .trim()
    .isIn(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'])
    .withMessage('Invalid meal type'),
  body('difficulty')
    .optional()
    .trim()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Invalid difficulty setting'),
  body('cookingTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Cooking time must be a positive integer'),
  body('diet')
    .optional()
    .trim()
    .isString(),
  body('spicyLevel')
    .optional()
    .trim()
    .isIn(['None', 'Mild', 'Medium', 'Hot'])
    .withMessage('Invalid spicy level'),
  validateRequest,
];

export const createRecipeValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Recipe title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),
  body('ingredients.*.name')
    .trim()
    .notEmpty()
    .withMessage('Ingredient name is required'),
  body('ingredients.*.amount')
    .isFloat({ min: 0.01 })
    .withMessage('Ingredient amount must be a positive number'),
  body('ingredients.*.unit')
    .optional()
    .trim()
    .isString(),
  body('steps')
    .isArray({ min: 1 })
    .withMessage('At least one cooking step is required'),
  body('prepTime')
    .isInt({ min: 0 })
    .withMessage('Preparation time must be a non-negative integer'),
  body('cookTime')
    .isInt({ min: 0 })
    .withMessage('Cooking time must be a non-negative integer'),
  body('totalTime')
    .isInt({ min: 0 })
    .withMessage('Total time must be a non-negative integer'),
  body('difficulty')
    .optional()
    .trim()
    .isIn(['Easy', 'Medium', 'Hard']),
  body('calories')
    .optional()
    .isInt({ min: 0 }),
  body('nutrition')
    .optional()
    .isObject(),
  body('nutrition.protein')
    .optional()
    .isFloat({ min: 0 }),
  body('nutrition.fat')
    .optional()
    .isFloat({ min: 0 }),
  body('nutrition.carbs')
    .optional()
    .isFloat({ min: 0 }),
  body('servingSize')
    .optional()
    .isInt({ min: 1 }),
  body('category')
    .optional()
    .isMongoId()
    .withMessage('Category must be a valid Mongo ID'),
  body('tags')
    .optional()
    .isArray(),
  body('spicyLevel')
    .optional()
    .trim()
    .isIn(['None', 'Mild', 'Medium', 'Hot']),
  body('mealType')
    .optional()
    .trim()
    .isIn(['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert']),
  validateRequest,
];

export const commentValidator = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 300 })
    .withMessage('Comment cannot exceed 300 characters'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  validateRequest,
];

export const categoryValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 50 })
    .withMessage('Category name cannot exceed 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  validateRequest,
];

export const mongoIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid database ID identifier'),
  validateRequest,
];

export const recipeIdValidator = [
  param('recipeId')
    .isMongoId()
    .withMessage('Invalid recipe ID identifier'),
  validateRequest,
];
