import PDFDocument from 'pdfkit';
import ShoppingList from '../models/shoppingListModel.js';
import Recipe from '../models/recipeModel.js';
import { ErrorResponse } from '../middlewares/errorMiddleware.js';

/**
 * @desc    Generate a Shopping List from a list of recipe IDs
 * @route   POST /api/shoppinglists/generate
 * @access  Private
 */
export const generateShoppingList = async (req, res, next) => {
  const { recipeIds, name } = req.body;

  if (!recipeIds || !Array.isArray(recipeIds) || recipeIds.length === 0) {
    return next(new ErrorResponse('Please provide an array of recipe IDs', 400));
  }

  try {
    // Fetch recipes
    const recipes = await Recipe.find({ _id: { $in: recipeIds } });

    if (recipes.length === 0) {
      return next(new ErrorResponse('No matching recipes found', 404));
    }

    // Ingredient Aggregation Dictionary
    // Key format: "ingredient_name_unit"
    const ingredientMap = new Map();

    recipes.forEach((recipe) => {
      recipe.ingredients.forEach((ing) => {
        const cleanName = ing.name.trim().toLowerCase();
        const cleanUnit = ing.unit.trim().toLowerCase();
        const key = `${cleanName}_${cleanUnit}`;

        if (ingredientMap.has(key)) {
          const existing = ingredientMap.get(key);
          existing.amount += ing.amount;
        } else {
          ingredientMap.set(key, {
            name: ing.name.trim(), // Keep original casing
            amount: ing.amount,
            unit: ing.unit.trim(),
            checked: false,
          });
        }
      });
    });

    const aggregatedItems = Array.from(ingredientMap.values());

    const shoppingList = await ShoppingList.create({
      user: req.user._id,
      name: name || `Shopping List - ${new Date().toLocaleDateString()}`,
      items: aggregatedItems,
      recipes: recipes.map((r) => r._id),
    });

    res.status(201).json({
      success: true,
      message: 'Shopping list generated successfully',
      shoppingList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Shopping Lists of user
 * @route   GET /api/shoppinglists
 * @access  Private
 */
export const getShoppingLists = async (req, res, next) => {
  try {
    const shoppingLists = await ShoppingList.find({ user: req.user._id })
      .populate('recipes', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shoppingLists.length,
      shoppingLists,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Shopping List Details
 * @route   GET /api/shoppinglists/:id
 * @access  Private
 */
export const getShoppingListById = async (req, res, next) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id).populate('recipes', 'title');

    if (!shoppingList) {
      return next(new ErrorResponse('Shopping list not found', 404));
    }

    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to access this list', 403));
    }

    res.status(200).json({
      success: true,
      shoppingList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Shopping List Items or Name
 * @route   PUT /api/shoppinglists/:id
 * @access  Private
 */
export const updateShoppingList = async (req, res, next) => {
  const { name, items } = req.body;

  try {
    let shoppingList = await ShoppingList.findById(req.params.id);

    if (!shoppingList) {
      return next(new ErrorResponse('Shopping list not found', 404));
    }

    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to update this list', 403));
    }

    if (name) shoppingList.name = name;
    if (items) shoppingList.items = items;

    await shoppingList.save();

    res.status(200).json({
      success: true,
      message: 'Shopping list updated successfully',
      shoppingList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Shopping List
 * @route   DELETE /api/shoppinglists/:id
 * @access  Private
 */
export const deleteShoppingList = async (req, res, next) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id);

    if (!shoppingList) {
      return next(new ErrorResponse('Shopping list not found', 404));
    }

    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to delete this list', 403));
    }

    await ShoppingList.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Shopping list deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export and Download Shopping List as a beautifully structured PDF
 * @route   GET /api/shoppinglists/:id/pdf
 * @access  Private
 */
export const downloadShoppingListPDF = async (req, res, next) => {
  try {
    const shoppingList = await ShoppingList.findById(req.params.id).populate('recipes', 'title');

    if (!shoppingList) {
      return next(new ErrorResponse('Shopping list not found', 404));
    }

    if (shoppingList.user.toString() !== req.user._id.toString()) {
      return next(new ErrorResponse('Not authorized to access this list', 403));
    }

    // Set Response Headers for Streaming File Download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="ShoppingList_${shoppingList._id}.pdf"`
    );

    // Initialize PDF Document
    const doc = new PDFDocument({ margin: 50 });

    // Pipe PDF directly to response stream
    doc.pipe(res);

    // 1. Header Banner
    doc
      .fillColor('#22C55E') // Primary theme color
      .fontSize(24)
      .text('RecipeAI', { align: 'center', wordSpacing: 2 })
      .fillColor('#475569')
      .fontSize(10)
      .text('Your AI-Powered Kitchen Assistant', { align: 'center' });

    doc.moveDown(1.5);

    // Draw horizontal separator rule
    doc
      .strokeColor('#E2E8F0')
      .lineWidth(1)
      .moveTo(50, 95)
      .lineTo(562, 95)
      .stroke();

    doc.moveDown(1);

    // 2. Shopping List Title & Meta details
    doc
      .fillColor('#1E293B')
      .fontSize(16)
      .text(shoppingList.name, { underline: true });
    
    doc
      .fontSize(9)
      .fillColor('#94A3B8')
      .text(`Generated on: ${new Date(shoppingList.createdAt).toLocaleDateString()}`);

    doc.moveDown(1.5);

    // 3. Render List Items
    doc
      .fillColor('#1E293B')
      .fontSize(12)
      .text('Shopping Checklist:', { underline: false });
    
    doc.moveDown(0.5);

    shoppingList.items.forEach((item) => {
      const checkSymbol = item.checked ? '[X]' : '[  ]';
      const itemText = `${checkSymbol}   ${item.amount} ${item.unit || ''}  -  ${item.name}`;

      doc
        .fontSize(11)
        .fillColor(item.checked ? '#94A3B8' : '#334155')
        .text(itemText);
      doc.moveDown(0.4);
    });

    doc.moveDown(1.5);

    // 4. Recipes citation list footer
    if (shoppingList.recipes && shoppingList.recipes.length > 0) {
      doc
        .strokeColor('#F1F5F9')
        .lineWidth(1)
        .moveTo(50, doc.y)
        .lineTo(562, doc.y)
        .stroke();
      
      doc.moveDown(0.8);
      
      doc
        .fontSize(9)
        .fillColor('#64748B')
        .text('Generated from Recipes:', { bold: true });
      
      shoppingList.recipes.forEach((recipe) => {
        doc.text(`- ${recipe.title}`);
      });
    }

    // Terminate PDF Document writing
    doc.end();
  } catch (error) {
    next(error);
  }
};
