import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient name is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Ingredient amount is required'],
  },
  unit: {
    type: String,
    default: '',
    trim: true,
  },
});

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a recipe title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isAI: {
      type: Boolean,
      default: false,
    },
    ingredients: {
      type: [ingredientSchema],
      validate: [
        (val) => val.length > 0,
        'Please add at least one ingredient',
      ],
    },
    steps: {
      type: [String],
      validate: [
        (val) => val.length > 0,
        'Please add at least one cooking step',
      ],
    },
    prepTime: {
      type: Number,
      required: [true, 'Please add preparation time in minutes'],
      min: [0, 'Prep time cannot be negative'],
    },
    cookTime: {
      type: Number,
      required: [true, 'Please add cooking time in minutes'],
      min: [0, 'Cook time cannot be negative'],
    },
    totalTime: {
      type: Number,
      required: [true, 'Please add total time in minutes'],
      min: [0, 'Total time cannot be negative'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    cuisine: {
      type: String,
      trim: true,
      default: 'Any',
    },
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      default: 0,
    },
    nutrition: {
      protein: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 },
    },
    servingSize: {
      type: Number,
      default: 1,
      min: [1, 'Serving size must be at least 1'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: false,
    },
    tags: [String],
    image: {
      type: String,
      default: '',
    },
    cookingTips: [String],
    storageTips: [String],
    healthyAlternatives: [String],
    spicyLevel: {
      type: String,
      enum: ['None', 'Mild', 'Medium', 'Hot'],
      default: 'None',
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert'],
      default: 'Dinner',
    },
    views: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    favoritesCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5'],
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing fields for robust search functionality (title, ingredients, description)
recipeSchema.index({
  title: 'text',
  description: 'text',
  'ingredients.name': 'text',
});

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;
