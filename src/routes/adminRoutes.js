import express from 'express';
import { 
  getPlatformAnalytics, 
  getAllUsers, 
  updateUserRole, 
  deletePlatformDestination 
} from '../controllers/adminController.js';
import { authenticateToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Guard all admin routes with authentication and admin privilege requirement
router.use(authenticateToken, requireAdmin);

router.get('/analytics', getPlatformAnalytics);
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/destinations/:id', deletePlatformDestination);

export default router;
