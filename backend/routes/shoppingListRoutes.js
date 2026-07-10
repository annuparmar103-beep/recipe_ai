import express from 'express';
import {
  generateShoppingList,
  getShoppingLists,
  getShoppingListById,
  updateShoppingList,
  deleteShoppingList,
  downloadShoppingListPDF,
} from '../controllers/shoppingListController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all shopping list endpoints

router.post('/generate', generateShoppingList);
router.get('/', getShoppingLists);
router.get('/:id', getShoppingListById);
router.put('/:id', updateShoppingList);
router.delete('/:id', deleteShoppingList);
router.get('/:id/pdf', downloadShoppingListPDF);

export default router;
