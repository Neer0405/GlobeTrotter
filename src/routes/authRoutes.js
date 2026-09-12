import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword,
  updateProfile,
  changePassword,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  deleteAccount
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Auth Endpoints
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected Auth Endpoints (Requires valid JWT bearer token)
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfile);
router.post('/change-password', authenticateToken, changePassword);

// Protected Wishlist Endpoints
router.get('/wishlist', authenticateToken, getWishlist);
router.post('/wishlist', authenticateToken, addToWishlist);
router.delete('/wishlist/:id', authenticateToken, removeFromWishlist);

// Protected Account Management Endpoints
router.delete('/account', authenticateToken, deleteAccount);

export default router;

