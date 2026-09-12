import express from 'express';
import { searchCities, getCityById, addCityToTrip } from '../controllers/cityController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', searchCities);
router.get('/:id', getCityById);

// Protected routes
router.post('/:id/add-to-trip', authenticateToken, addCityToTrip);

export default router;
