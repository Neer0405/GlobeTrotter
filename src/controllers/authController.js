import db from '../config/database.js';
import { hashPassword, comparePassword, generateResetToken, hashToken } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { 
  validateRegistrationInput, 
  validateLoginInput, 
  validateResetPasswordInput,
  isValidEmail,
  isValidPassword 
} from '../utils/validators.js';

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
export async function register(req, res) {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // 1. Input Validation
    const validation = validateRegistrationInput({ name, email, password, confirmPassword });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check if email already exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // 3. Hash Password
    const hashedPassword = await hashPassword(password);

    // 4. Create User Record
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    const insertStmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, avatar_url)
      VALUES (?, ?, ?, ?)
    `);

    const result = insertStmt.run(name.trim(), normalizedEmail, hashedPassword, defaultAvatar);
    const userId = result.lastInsertRowid;

    // 5. Fetch created user data
    const user = db.prepare('SELECT id, name, email, avatar_url, bio, role, created_at FROM users WHERE id = ?').get(userId);

    // 6. Generate JWT Token
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during registration.'
    });
  }
}

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and issue token
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    // 1. Input Validation
    const validation = validateLoginInput({ email, password });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 2. Find user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 3. Verify Password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 4. Exclude password hash from response
    const { password_hash, ...userProfile } = user;

    // 5. Generate Token
    const token = generateToken(userProfile);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userProfile
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login.'
    });
  }
}

/**
 * @route GET /api/auth/me
 * @desc Get currently authenticated user profile
 */
export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    user: req.user
  });
}

/**
 * @route POST /api/auth/forgot-password
 * @desc Generate password reset token
 */
export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT id, name, email FROM users WHERE email = ?').get(normalizedEmail);

    // Generic response for security (do not disclose if user exists)
    const successMsg = 'If an account exists with that email, a password reset token has been generated.';

    if (!user) {
      return res.status(200).json({
        success: true,
        message: successMsg
      });
    }

    // Generate token
    const { rawToken, tokenHash } = generateResetToken();
    const expiresInMins = parseInt(process.env.RESET_TOKEN_EXPIRES_IN_MINS || '60', 10);
    const expiresAt = new Date(Date.now() + expiresInMins * 60 * 1000).toISOString();

    // Invalidate old tokens for this user
    db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ?').run(user.id);

    // Save token hash to DB
    db.prepare(`
      INSERT INTO password_resets (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `).run(user.id, tokenHash, expiresAt);

    return res.status(200).json({
      success: true,
      message: successMsg,
      // Returning token in dev environment for easy testing & frontend modal integration
      resetToken: rawToken,
      expiresAt
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during password reset request.'
    });
  }
}

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password using valid reset token
 */
export async function resetPassword(req, res) {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    const validation = validateResetPasswordInput({ token, newPassword, confirmPassword });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const tokenHash = hashToken(token.trim());

    // Lookup valid token
    const resetRecord = db.prepare(`
      SELECT * FROM password_resets 
      WHERE token_hash = ? AND used = 0 AND datetime(expires_at) > datetime('now')
    `).get(tokenHash);

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Transaction to update password & mark token as used
    const updatePasswordTx = db.transaction(() => {
      db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
        .run(newPasswordHash, resetRecord.user_id);

      db.prepare('UPDATE password_resets SET used = 1 WHERE id = ?')
        .run(resetRecord.id);
    });

    updatePasswordTx();

    return res.status(200).json({
      success: true,
      message: 'Password reset successful! You can now log in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during password reset.'
    });
  }
}

/**
 * @route PUT /api/auth/profile
 * @desc Update logged in user profile (name, bio, avatar, currency, language)
 */
export async function updateProfile(req, res) {
  try {
    const { name, bio, avatar_url, currency, language } = req.body;
    const userId = req.user.id;

    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
      return res.status(400).json({
        success: false,
        message: 'Name must be at least 2 characters long.'
      });
    }

    const currentName = name ? name.trim() : req.user.name;
    const currentBio = bio !== undefined ? bio : req.user.bio;
    const currentAvatar = avatar_url !== undefined ? avatar_url : req.user.avatar_url;
    const currentCurrency = currency !== undefined ? currency : (req.user.currency || 'USD');
    const currentLanguage = language !== undefined ? language : (req.user.language || 'en');

    db.prepare(`
      UPDATE users 
      SET name = ?, bio = ?, avatar_url = ?, currency = ?, language = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(currentName, currentBio, currentAvatar, currentCurrency, currentLanguage, userId);

    const updatedUser = db.prepare('SELECT id, name, email, avatar_url, bio, currency, language, role, created_at FROM users WHERE id = ?').get(userId);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while updating profile.'
    });
  }
}

/**
 * @route POST /api/auth/change-password
 * @desc Change password for authenticated user
 */
export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword || !isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid current and new passwords (min 6 chars).'
      });
    }

    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New passwords do not match.'
      });
    }

    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId);
    const isCurrentValid = await comparePassword(currentPassword, user.password_hash);

    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password.'
      });
    }

    const newPasswordHash = await hashPassword(newPassword);
    db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(newPasswordHash, userId);

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error while changing password.'
    });
  }
}

/**
 * @route GET /api/auth/wishlist
 * @desc Get user's saved wishlist destinations
 */
export function getWishlist(req, res) {
  try {
    const userId = req.user.id;
    const items = db.prepare('SELECT * FROM saved_wishlist WHERE user_id = ? ORDER BY created_at DESC').all(userId);

    res.status(200).json({
      success: true,
      count: items.length,
      wishlist: items
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
  }
}

/**
 * @route POST /api/auth/wishlist
 * @desc Add item to saved wishlist
 */
export function addToWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { title, location, image_url, item_type } = req.body;

    if (!title || !location) {
      return res.status(400).json({ success: false, message: 'Title and location are required.' });
    }

    const img = image_url || 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e';
    const type = item_type || 'destination';

    const stmt = db.prepare(`
      INSERT INTO saved_wishlist (user_id, title, location, image_url, item_type)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(userId, title, location, img, type);
    const newItem = db.prepare('SELECT * FROM saved_wishlist WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: `'${title}' saved to your travel wishlist! ❤️`,
      wishlistItem: newItem
    });
  } catch (error) {
    console.error('Add wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to add item to wishlist.' });
  }
}

/**
 * @route DELETE /api/auth/wishlist/:id
 * @desc Remove item from wishlist
 */
export function removeFromWishlist(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    db.prepare('DELETE FROM saved_wishlist WHERE id = ? AND user_id = ?').run(id, userId);

    res.status(200).json({
      success: true,
      message: 'Item removed from wishlist.'
    });
  } catch (error) {
    console.error('Remove wishlist error:', error);
    res.status(500).json({ success: false, message: 'Failed to remove item from wishlist.' });
  }
}

/**
 * @route DELETE /api/auth/account
 * @desc Account management action (Permanently delete account)
 */
export function deleteAccount(req, res) {
  try {
    const userId = req.user.id;
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully.'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
}

