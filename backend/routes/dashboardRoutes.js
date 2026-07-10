import express from 'express';
import { getUserStats, getAdminStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect); // All dashboard views require authorization

router.get('/user', getUserStats);
router.get('/admin', authorize('admin'), getAdminStats);

export default router;
