import { Router } from 'express';
import {
  updateStop,
  deleteStop,
  addActivityToStop,
  updateStopActivity,
  deleteStopActivity,
  reorderStops,
} from '../controllers/stop.controller';
import { deleteBudgetItem } from '../controllers/budget.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.put('/reorder', reorderStops);
router.put('/stops/:id', updateStop);
router.delete('/stops/:id', deleteStop);

router.post('/stops/:id/activities', addActivityToStop);
router.put('/stop-activities/:id', updateStopActivity);
router.delete('/stop-activities/:id', deleteStopActivity);

router.delete('/budget-items/:id', deleteBudgetItem);

export default router;
