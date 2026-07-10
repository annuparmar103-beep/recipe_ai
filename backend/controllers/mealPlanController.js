import MealPlan from '../models/mealPlanModel.js';
import { ErrorResponse } from '../middlewares/errorMiddleware.js';

/**
 * @desc    Create a new Meal Plan schedule entry
 * @route   POST /api/mealplans
 * @access  Private
 */
export const createMealPlan = async (req, res, next) => {
  const { date, mealType, recipe, note } = req.body;

  try {
    // Parse date to start of the day in UTC/local to normalize times
    const normalDate = new Date(date);
    normalDate.setHours(0, 0, 0, 0);

    // Check if slot is already occupied
    const slotOccupied = await MealPlan.findOne({
      user: req.user._id,
      date: normalDate,
      mealType,
    });

    if (slotOccupied) {
      return next(
        new ErrorResponse(
          `You already scheduled a recipe for ${mealType} on this date. Please edit or delete the existing plan first.`,
          400
        )
      );
    }

    const mealPlan = await MealPlan.create({
      user: req.user._id,
      date: normalDate,
      mealType,
      recipe,
      note,
    });

    await mealPlan.populate('recipe', 'title totalTime difficulty image');

    res.status(201).json({
      success: true,
      message: 'Meal plan added successfully',
      mealPlan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Meal Plans within an optional date range
 * @route   GET /api/mealplans
 * @access  Private
 */
export const getMealPlans = async (req, res, next) => {
  const { startDate, endDate } = req.query;

  try {
    const filter = { user: req.user._id };

    // Apply date range filters if parameters are present
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.date.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.date.$lte = end;
      }
    }

    const mealPlans = await MealPlan.find(filter)
      .populate('recipe', 'title totalTime difficulty image')
      .sort({ date: 1, mealType: 1 });

    res.status(200).json({
      success: true,
      count: mealPlans.length,
      mealPlans,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a Meal Plan schedule note or details
 * @route   PUT /api/mealplans/:id
 * @access  Private
 */
export const updateMealPlan = async (req, res, next) => {
  const { date, mealType, recipe, note } = req.body;

  try {
    let mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return next(new ErrorResponse('Meal plan entry not found', 404));
    }

    // Authorization check
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('You are not authorized to edit this plan', 403));
    }

    // Check slots constraints if updating slot details
    if (date || mealType) {
      const targetDate = date ? new Date(date) : mealPlan.date;
      targetDate.setHours(0, 0, 0, 0);
      const targetSlot = mealType || mealPlan.mealType;

      // Only check if it's a different slot than current
      if (targetDate.getTime() !== mealPlan.date.getTime() || targetSlot !== mealPlan.mealType) {
        const occupied = await MealPlan.findOne({
          user: req.user._id,
          date: targetDate,
          mealType: targetSlot,
          _id: { $ne: mealPlan._id },
        });

        if (occupied) {
          return next(
            new ErrorResponse(
              `The destination slot (${targetSlot}) is already occupied.`,
              400
            )
          );
        }
      }
      if (date) mealPlan.date = targetDate;
      if (mealType) mealPlan.mealType = targetSlot;
    }

    if (recipe) mealPlan.recipe = recipe;
    if (note !== undefined) mealPlan.note = note;

    await mealPlan.save();
    await mealPlan.populate('recipe', 'title totalTime difficulty image');

    res.status(200).json({
      success: true,
      message: 'Meal plan updated successfully',
      mealPlan,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a Meal Plan schedule entry
 * @route   DELETE /api/mealplans/:id
 * @access  Private
 */
export const deleteMealPlan = async (req, res, next) => {
  try {
    const mealPlan = await MealPlan.findById(req.params.id);

    if (!mealPlan) {
      return next(new ErrorResponse('Meal plan entry not found', 404));
    }

    // Authorization check
    if (mealPlan.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('You are not authorized to delete this plan', 403));
    }

    await MealPlan.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Meal plan entry removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
