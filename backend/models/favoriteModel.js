import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'Recipe reference is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent user from favoriting the same recipe multiple times
favoriteSchema.index({ user: 1, recipe: 1 }, { unique: true });

// Static method to update favoritesCount on Recipe
favoriteSchema.statics.updateFavoritesCount = async function (recipeId) {
  const count = await this.countDocuments({ recipe: recipeId });
  try {
    await mongoose.model('Recipe').findByIdAndUpdate(recipeId, {
      favoritesCount: count,
    });
  } catch (error) {
    console.error(`[Favorite Model aggregate error]: ${error.message}`);
  }
};

// Call updateFavoritesCount after saving a favorite record
favoriteSchema.post('save', async function () {
  await this.constructor.updateFavoritesCount(this.recipe);
});

// Call updateFavoritesCount after deleting a favorite record
favoriteSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.updateFavoritesCount(doc.recipe);
  }
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
