import { Router } from 'express';
import {
  getTrips,
  getTripById,
  createTrip,
  updateTrip,
  deleteTrip,
  uploadCoverPhoto,
  copyTrip,
} from '../controllers/trip.controller';
import { addStop } from '../controllers/stop.controller';
import { getTripBudget, addBudgetItem } from '../controllers/budget.controller';
import { authenticateJWT } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticateJWT);

router.get('/', getTrips);
router.post('/', createTrip);
router.post('/upload-cover', upload.single('cover'), uploadCoverPhoto);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/stops', addStop);
router.get('/:id/budget', getTripBudget);
router.post('/:id/budget-items', addBudgetItem);
router.post('/:id/copy', copyTrip);

export default router;
