import Category from '../models/categoryModel.js';
import { ErrorResponse } from '../middlewares/errorMiddleware.js';
import { deleteImage } from '../services/uploadService.js';

/**
 * @desc    Create a Category
 * @route   POST /api/categories
 * @access  Private/Admin
 */
export const createCategory = async (req, res, next) => {
  const { name, description, image, status } = req.body;

  try {
    const existing = await Category.findOne({ name });
    if (existing) {
      return next(new ErrorResponse('Category already exists with this name', 400));
    }

    const category = await Category.create({
      name,
      description,
      image,
      status,
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get All Categories
 * @route   GET /api/categories
 * @access  Public
 */
export const getCategories = async (req, res, next) => {
  try {
    // If not admin, only show active categories
    const filter = {};
    if (!req.user || req.user.role !== 'admin') {
      filter.status = 'active';
    }

    const categories = await Category.find(filter).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Category
 * @route   PUT /api/categories/:id
 * @access  Private/Admin
 */
export const updateCategory = async (req, res, next) => {
  const { name, description, image, status } = req.body;

  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }

    // If updating image and old image exists, clean it up
    if (image && category.image && image !== category.image) {
      await deleteImage(category.image);
    }

    category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, image, status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Category
 * @route   DELETE /api/categories/:id
 * @access  Private/Admin
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new ErrorResponse('Category not found', 404));
    }

    // Clean up category image
    if (category.image) {
      await deleteImage(category.image);
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
