import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'Recipe reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    content: {
      type: String,
      required: [true, 'Please add a comment description'],
      trim: true,
      maxlength: [300, 'Comment content cannot exceed 300 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Please add a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from submitting multiple comments on the same recipe
commentSchema.index({ recipe: 1, user: 1 }, { unique: true });

// Static method to calculate and update average rating & comments count on Recipe
commentSchema.statics.calculateAverageRating = async function (recipeId) {
  const stats = await this.aggregate([
    {
      $match: { recipe: recipeId },
    },
    {
      $group: {
        _id: '$recipe',
        averageRating: { $avg: '$rating' },
        commentsCount: { $sum: 1 },
      },
    },
  ]);

  try {
    if (stats.length > 0) {
      await mongoose.model('Recipe').findByIdAndUpdate(recipeId, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        commentsCount: stats[0].commentsCount,
      });
    } else {
      await mongoose.model('Recipe').findByIdAndUpdate(recipeId, {
        averageRating: 0,
        commentsCount: 0,
      });
    }
  } catch (error) {
    console.error(`[Comment Model aggregate error]: ${error.message}`);
  }
};

// Call calculateAverageRating after saving comment
commentSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.recipe);
});

// Call calculateAverageRating after deleting comment
commentSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.recipe);
  }
});

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;
