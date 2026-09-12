import express from 'express';
import { 
  createTrip, 
  getUserTrips, 
  getTripById, 
  updateTrip, 
  deleteTrip, 
  getSharedTrip, 
  cloneSharedTrip,
  getPresetCoverPhotos 
} from '../controllers/tripController.js';
import { 
  getTripStops, 
  addTripStop, 
  reorderTripStops, 
  deleteTripStop, 
  addTripActivity, 
  deleteTripActivity, 
  getFullItinerary 
} from '../controllers/itineraryController.js';
import {
  getBudgetAnalytics,
  addTripExpense,
  deleteTripExpense,
  updateActivityTime
} from '../controllers/budgetController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (No token required)
router.get('/presets/photos', getPresetCoverPhotos);
router.get('/share/:share_code', getSharedTrip);
router.post('/share/:share_code/clone', authenticateToken, cloneSharedTrip);

// Protected trip management routes
router.post('/', authenticateToken, createTrip);
router.get('/', authenticateToken, getUserTrips);
router.get('/:id', authenticateToken, getTripById);
router.put('/:id', authenticateToken, updateTrip);
router.delete('/:id', authenticateToken, deleteTrip);

// Protected stop management routes
router.get('/:trip_id/stops', authenticateToken, getTripStops);
router.post('/:trip_id/stops', authenticateToken, addTripStop);
router.put('/:trip_id/stops/reorder', authenticateToken, reorderTripStops);
router.delete('/:trip_id/stops/:stop_id', authenticateToken, deleteTripStop);

// Protected activity management routes
router.post('/:trip_id/activities', authenticateToken, addTripActivity);
router.put('/:trip_id/activities/:activity_id/time', authenticateToken, updateActivityTime);
router.delete('/:trip_id/activities/:activity_id', authenticateToken, deleteTripActivity);

// Protected budget analytics & expense routes
router.get('/:trip_id/budget-analytics', authenticateToken, getBudgetAnalytics);
router.post('/:trip_id/expenses', authenticateToken, addTripExpense);
router.delete('/:trip_id/expenses/:expense_id', authenticateToken, deleteTripExpense);

// Structured full itinerary breakdown
router.get('/:trip_id/full-itinerary', authenticateToken, getFullItinerary);

export default router;
