import User from '../models/userModel.js';
import Recipe from '../models/recipeModel.js';
import Category from '../models/categoryModel.js';
import Comment from '../models/commentModel.js';
import Favorite from '../models/favoriteModel.js';
import MealPlan from '../models/mealPlanModel.js';
import ShoppingList from '../models/shoppingListModel.js';

/**
 * @desc    Get stats specific to the authenticated user
 * @route   GET /api/dashboards/user
 * @access  Private
 */
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Parallel calls to speed up database response times
    const [recipesCount, favoritesCount, mealPlansCount, shoppingListsCount, aiRecipesCount] =
      await Promise.all([
        Recipe.countDocuments({ author: userId }),
        Favorite.countDocuments({ user: userId }),
        MealPlan.countDocuments({ user: userId }),
        ShoppingList.countDocuments({ user: userId }),
        Recipe.countDocuments({ author: userId, isAI: true }),
      ]);

    res.status(200).json({
      success: true,
      stats: {
        recipes: recipesCount,
        favorites: favoritesCount,
        mealPlans: mealPlansCount,
        shoppingLists: shoppingListsCount,
        aiUsage: aiRecipesCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get global statistics & aggregation datasets for chart visualization (Admin only)
 * @route   GET /api/dashboards/admin
 * @access  Private/Admin
 */
export const getAdminStats = async (req, res, next) => {
  try {
    // 1. Global Metrics Counters
    const [totalUsers, totalRecipes, totalCategories, totalComments, totalFavorites] =
      await Promise.all([
        User.countDocuments(),
        Recipe.countDocuments(),
        Category.countDocuments(),
        Comment.countDocuments(),
        Favorite.countDocuments(),
      ]);

    // 2. Aggregate recipes by Category distributions
    const categoryStats = await Recipe.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Populate category names manually or via loop for category stats
    const populatedCategoryStats = await Promise.all(
      categoryStats.map(async (stat) => {
        if (!stat._id) {
          return { name: 'Uncategorized', value: stat.count };
        }
        const category = await Category.findById(stat._id);
        return {
          name: category ? category.name : 'Uncategorized',
          value: stat.count,
        };
      })
    );

    // 3. User Signups trend (last 6 months)
    const registrationsStats = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          registrations: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 6 },
    ]);

    const formattedRegistrations = registrationsStats.map((item) => ({
      month: item._id,
      users: item.registrations,
    }));

    // 4. Recipes creation distribution (AI vs User-created)
    const sourceStats = await Recipe.aggregate([
      {
        $group: {
          _id: '$isAI',
          count: { $sum: 1 },
        },
      },
    ]);

    const formattedSources = sourceStats.map((item) => ({
      name: item._id ? 'AI Generated' : 'User Created',
      value: item.count,
    }));

    // 5. Popular recipes by view count
    const popularRecipes = await Recipe.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title views likesCount averageRating');

    res.status(200).json({
      success: true,
      metrics: {
        users: totalUsers,
        recipes: totalRecipes,
        categories: totalCategories,
        comments: totalComments,
        favorites: totalFavorites,
      },
      charts: {
        categoryDistribution: populatedCategoryStats,
        userRegistrations: formattedRegistrations,
        creationSources: formattedSources,
        popularRecipes: popularRecipes.map((r) => ({
          title: r.title,
          views: r.views,
          likes: r.likesCount,
          rating: r.averageRating,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
