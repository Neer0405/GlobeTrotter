import { Router } from 'express';
import { getAdminStats } from '../controllers/admin.controller';
import { authenticateJWT, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get('/stats', getAdminStats);

export default router;
