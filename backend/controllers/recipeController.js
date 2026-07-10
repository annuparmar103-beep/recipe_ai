import Recipe from '../models/recipeModel.js';
import Category from '../models/categoryModel.js';
import Favorite from '../models/favoriteModel.js';
import Comment from '../models/commentModel.js';
import Notification from '../models/notificationModel.js';
import { generateRecipeFromAI } from '../services/geminiService.js';
import { ErrorResponse } from '../middlewares/errorMiddleware.js';
import { deleteImage } from '../services/uploadService.js';

/**
 * @desc    Generate an AI recipe based on ingredients and options
 * @route   POST /api/recipes/generate
 * @access  Private
 */
export const generateAiRecipe = async (req, res, next) => {
  try {
    const recipeData = await generateRecipeFromAI(req.body);

    res.status(200).json({
      success: true,
      message: 'Recipe generated successfully by Gemini AI',
      recipe: recipeData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a recipe manually or save a generated one
 * @route   POST /api/recipes
 * @access  Private
 */
export const createRecipe = async (req, res, next) => {
  try {
    // Add user as author
    req.body.author = req.user._id;

    // Check if category exists if provided
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return next(new ErrorResponse('Specified category does not exist', 400));
      }
    }

    const recipe = await Recipe.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      recipe,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all recipes with filtering, searching, sorting, and pagination
 * @route   GET /api/recipes
 * @access  Public
 */
export const getRecipes = async (req, res, next) => {
  try {
    const filter = {};

    // 1. Full-text search on title, description, and ingredients
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // 2. Exact match filters
    if (req.query.cuisine) {
      filter.cuisine = { $regex: new RegExp('^' + req.query.cuisine + '$', 'i') };
    }
    if (req.query.difficulty) {
      filter.difficulty = req.query.difficulty;
    }
    if (req.query.mealType) {
      filter.mealType = req.query.mealType;
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.author) {
      filter.author = req.query.author;
    }
    if (req.query.isAI) {
      filter.isAI = req.query.isAI === 'true';
    }

    // Favorites filter
    if (req.query.favorites === 'true') {
      if (!req.user) {
        return next(new ErrorResponse('Authentication required to view favorites', 401));
      }
      const favs = await Favorite.find({ user: req.user._id }).select('recipe');
      const recipeIds = favs.map(f => f.recipe);
      filter._id = { $in: recipeIds };
    }

    // 3. Range filters
    if (req.query.maxCalories) {
      filter.calories = { $lte: parseInt(req.query.maxCalories, 10) };
    }
    if (req.query.maxTime) {
      filter.totalTime = { $lte: parseInt(req.query.maxTime, 10) };
    }

    // 4. Filtering by specific ingredient
    if (req.query.ingredient) {
      filter['ingredients.name'] = { $regex: req.query.ingredient, $options: 'i' };
    }

    // 5. Query options for sorting
    let sortBy = { createdAt: -1 }; // Default: Newest first
    if (req.query.sortBy) {
      if (req.query.sortBy === 'popular') {
        sortBy = { views: -1 };
      } else if (req.query.sortBy === 'likes') {
        sortBy = { likesCount: -1 };
      } else if (req.query.sortBy === 'favorites') {
        sortBy = { favoritesCount: -1 };
      } else if (req.query.sortBy === 'rating') {
        sortBy = { averageRating: -1 };
      } else if (req.query.sortBy === 'time') {
        sortBy = { totalTime: 1 };
      }
    }

    // 6. Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 9;
    const skip = (page - 1) * limit;

    const total = await Recipe.countDocuments(filter);

    const recipes = await Recipe.find(filter)
      .populate('author', 'name profilePicture')
      .populate('category', 'name')
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: recipes.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      recipes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single recipe details by ID (increments views)
 * @route   GET /api/recipes/:id
 * @access  Public
 */
export const getRecipeById = async (req, res, next) => {
  try {
    // Increment view count using $inc on retrieval
    const recipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name profilePicture bio')
      .populate('category', 'name');

    if (!recipe) {
      return next(new ErrorResponse('Recipe not found', 404));
    }

    // Check if the authenticated user has liked or favorited this recipe
    let isLiked = false;
    let isFavorite = false;

    if (req.user) {
      isLiked = recipe.likedBy.includes(req.user._id);
      const favoriteExists = await Favorite.findOne({
        user: req.user._id,
        recipe: recipe._id,
      });
      isFavorite = !!favoriteExists;
    }

    res.status(200).json({
      success: true,
      isLiked,
      isFavorite,
      recipe,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update recipe details
 * @route   PUT /api/recipes/:id
 * @access  Private (Author or Admin only)
 */
export const updateRecipe = async (req, res, next) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return next(new ErrorResponse('Recipe not found', 404));
    }

    // Check author permissions
    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('You are not authorized to update this recipe', 403));
    }

    // Clean up old image if a new image is provided
    if (req.body.image && recipe.image && req.body.image !== recipe.image) {
      await deleteImage(recipe.image);
    }

    // Update category validation if provided
    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        return next(new ErrorResponse('Specified category does not exist', 400));
      }
    }

    recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Recipe updated successfully',
      recipe,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete recipe
 * @route   DELETE /api/recipes/:id
 * @access  Private (Author or Admin only)
 */
export const deleteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return next(new ErrorResponse('Recipe not found', 404));
    }

    // Check author permissions
    if (recipe.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('You are not authorized to delete this recipe', 403));
    }

    // Remove uploaded media file from Cloudinary/Disk
    if (recipe.image) {
      await deleteImage(recipe.image);
    }

    // Cascade deletion: Delete comments and favorites related to this recipe
    await Comment.deleteMany({ recipe: recipe._id });
    await Favorite.deleteMany({ recipe: recipe._id });

    await Recipe.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Recipe and related reviews deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle Favorite bookmark state
 * @route   POST /api/recipes/:id/favorite
 * @access  Private
 */
export const toggleFavoriteRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return next(new ErrorResponse('Recipe not found', 404));
    }

    const query = { user: req.user._id, recipe: recipe._id };
    const favoriteExists = await Favorite.findOne(query);

    let isFavorite = false;
    let message = '';

    if (favoriteExists) {
      // Unfavorite - triggers Mongoose post hook findOneAndDelete
      await Favorite.findOneAndDelete(query);
      message = 'Recipe removed from favorites';
    } else {
      // Favorite - triggers Mongoose post hook save
      await Favorite.create(query);
      isFavorite = true;
      message = 'Recipe added to favorites';

      // Send notification to author if favorited by another user
      if (recipe.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: recipe.author,
          title: 'Recipe Favorited!',
          message: `${req.user.name} added your recipe "${recipe.title}" to their favorites.`,
          type: 'like',
        });
      }
    }

    res.status(200).json({
      success: true,
      isFavorite,
      message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle Like state
 * @route   POST /api/recipes/:id/like
 * @access  Private
 */
export const toggleLikeRecipe = async (req, res, next) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return next(new ErrorResponse('Recipe not found', 404));
    }

    const userIndex = recipe.likedBy.indexOf(req.user._id);
    let isLiked = false;
    let message = '';

    if (userIndex !== -1) {
      // Unlike
      recipe.likedBy.splice(userIndex, 1);
      recipe.likesCount = Math.max(0, recipe.likesCount - 1);
      message = 'Recipe unliked';
    } else {
      // Like
      recipe.likedBy.push(req.user._id);
      recipe.likesCount += 1;
      isLiked = true;
      message = 'Recipe liked';

      // Send notification to author if liked by another user
      if (recipe.author.toString() !== req.user._id.toString()) {
        await Notification.create({
          user: recipe.author,
          title: 'Recipe Liked!',
          message: `${req.user.name} liked your recipe "${recipe.title}".`,
          type: 'like',
        });
      }
    }

    await recipe.save();

    res.status(200).json({
      success: true,
      isLiked,
      likesCount: recipe.likesCount,
      message,
    });
  } catch (error) {
    next(error);
  }
};
