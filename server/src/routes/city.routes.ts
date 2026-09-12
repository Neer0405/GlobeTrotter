import { Router } from 'express';
import { getCities, getCityById, syncCity, inspireDestinations } from '../controllers/city.controller';

const router = Router();

router.post('/sync', syncCity);
router.post('/inspire', inspireDestinations);
router.get('/', getCities);
router.get('/:id', getCityById);

export default router;
