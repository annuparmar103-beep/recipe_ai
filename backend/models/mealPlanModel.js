import mongoose from 'mongoose';

const mealPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Meal date is required'],
    },
    mealType: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
      required: [true, 'Meal type is required'],
    },
    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Recipe',
      required: [true, 'Recipe reference is required'],
    },
    note: {
      type: String,
      maxlength: [200, 'Meal planner note cannot exceed 200 characters'],
      default: '',
    },
    portions: {
      type: Number,
      default: 2,
      min: [1, 'Portions must be at least 1'],
    },
  },
  {
    timestamps: true,
  }
);

mealPlanSchema.virtual('slot').get(function () {
  return this.mealType ? this.mealType.toLowerCase() : '';
});

mealPlanSchema.set('toJSON', { virtuals: true });
mealPlanSchema.set('toObject', { virtuals: true });

// Prevent users from scheduling multiple recipes into the same slot on the same day
mealPlanSchema.index({ user: 1, date: 1, mealType: 1 }, { unique: true });

const MealPlan = mongoose.model('MealPlan', mealPlanSchema);
export default MealPlan;
