import express from 'express';
import { searchActivities, getActivityById } from '../controllers/activityController.js';

const router = express.Router();

// Public activity catalog routes
router.get('/', searchActivities);
router.get('/:id', getActivityById);

export default router;
