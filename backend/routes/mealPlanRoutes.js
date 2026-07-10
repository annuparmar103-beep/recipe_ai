import express from 'express';
import {
  createMealPlan,
  getMealPlans,
  updateMealPlan,
  deleteMealPlan,
} from '../controllers/mealPlanController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // Secure all meal planning endpoints

router.get('/', getMealPlans);
router.post('/', createMealPlan);
router.put('/:id', updateMealPlan);
router.delete('/:id', deleteMealPlan);

export default router;
