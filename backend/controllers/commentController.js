import Comment from '../models/commentModel.js';
import Recipe from '../models/recipeModel.js';
import Notification from '../models/notificationModel.js';
import { ErrorResponse } from '../middlewares/errorMiddleware.js';

/**
 * @desc    Add a comment/rating to a recipe
 * @route   POST /api/comments/recipe/:recipeId
 * @access  Private
 */
export const addComment = async (req, res, next) => {
  const { content, rating } = req.body;
  const recipeId = req.params.recipeId;

  try {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return next(new ErrorResponse('Recipe not found', 404));
    }

    // Check if the user has already commented on this recipe
    const alreadyCommented = await Comment.findOne({
      recipe: recipeId,
      user: req.user._id,
    });

    if (alreadyCommented) {
      return next(
        new ErrorResponse('You have already submitted a review for this recipe', 400)
      );
    }

    const comment = await Comment.create({
      recipe: recipeId,
      user: req.user._id,
      content,
      rating,
    });

    // Populate user details for returning
    await comment.populate('user', 'name profilePicture');

    // Create notification for recipe author if commenter is not the author
    if (recipe.author.toString() !== req.user._id.toString()) {
      await Notification.create({
        user: recipe.author,
        title: 'New Recipe Review',
        message: `${req.user.name} reviewed your recipe "${recipe.title}" and rated it ${rating} stars.`,
        type: 'comment',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      comment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all comments for a specific recipe
 * @route   GET /api/comments/recipe/:recipeId
 * @access  Public
 */
export const getRecipeComments = async (req, res, next) => {
  const recipeId = req.params.recipeId;

  try {
    const comments = await Comment.find({ recipe: recipeId })
      .populate('user', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a comment
 * @route   DELETE /api/comments/:id
 * @access  Private (Author or Admin only)
 */
export const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(new ErrorResponse('Review not found', 404));
    }

    // Check comment ownership
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new ErrorResponse('You are not authorized to delete this review', 403));
    }

    // Use findOneAndDelete to trigger Mongoose middleware
    await Comment.findOneAndDelete({ _id: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
