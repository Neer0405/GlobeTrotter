import express from 'express';
import { getDashboardSummary, getRecommendations } from '../controllers/dashboardController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected dashboard summary stats & recent trips
router.get('/summary', authenticateToken, getDashboardSummary);

// Recommended global destinations & popular activity highlights
router.get('/recommendations', getRecommendations);

export default router;
