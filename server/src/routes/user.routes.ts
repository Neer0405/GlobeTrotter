import { Router } from 'express';
import { updateProfile, deleteAccount, toggleSaveCity } from '../controllers/user.controller';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.put('/profile', updateProfile);
router.post('/save-city', toggleSaveCity);
router.delete('/account', deleteAccount);

export default router;
