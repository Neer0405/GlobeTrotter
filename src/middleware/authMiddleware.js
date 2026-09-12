import { verifyToken } from '../utils/jwt.js';
import db from '../config/database.js';

/**
 * Middleware to protect routes that require authentication
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;
    
  const token = tokenFromHeader || req.headers['x-access-token'] || req.query.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }

  // Fetch current user from database
  try {
    const user = db.prepare('SELECT id, name, email, avatar_url, bio, currency, language, role, created_at FROM users WHERE id = ?').get(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account associated with this token no longer exists.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware database error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication check.'
    });
  }
}

/**
 * Middleware to restrict endpoints to admin users
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Administrator privileges required.'
    });
  }
  next();
}

