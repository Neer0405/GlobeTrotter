import { Router } from 'express';
import { getPublicTrip } from '../controllers/trip.controller';

const router = Router();

router.get('/trips/:id', getPublicTrip);

export default router;
