import mongoose from 'mongoose';

const shoppingItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Ingredient item name is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Ingredient quantity amount is required'],
    min: [0, 'Amount cannot be negative'],
  },
  unit: {
    type: String,
    default: '',
    trim: true,
  },
  checked: {
    type: Boolean,
    default: false,
  },
});

const shoppingListSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    name: {
      type: String,
      default: 'My Shopping List',
      trim: true,
    },
    items: [shoppingItemSchema],
    recipes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recipe',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const ShoppingList = mongoose.model('ShoppingList', shoppingListSchema);
export default ShoppingList;
