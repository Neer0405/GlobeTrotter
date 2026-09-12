import db from '../config/database.js';

/**
 * GET /api/admin/analytics
 * Platform usage statistics & insights dashboard.
 */
export function getPlatformAnalytics(req, res, next) {
  try {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const totalTrips = db.prepare('SELECT COUNT(*) as count FROM trips').get().count;
    const totalStops = db.prepare('SELECT COUNT(*) as count FROM trip_stops').get().count;
    const totalActivities = db.prepare('SELECT COUNT(*) as count FROM trip_activities').get().count;
    const totalExpenses = db.prepare('SELECT COUNT(*) as count FROM trip_expenses').get().count;

    // Popular destinations based on trips table destination_location
    const popularDestinations = db.prepare(`
      SELECT destination_location as location, COUNT(*) as trip_count
      FROM trips
      GROUP BY destination_location
      ORDER BY trip_count DESC
      LIMIT 5
    `).all();

    // Top activity categories in itineraries
    const topActivityCategories = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM trip_activities
      GROUP BY category
      ORDER BY count DESC
      LIMIT 5
    `).all();

    // Recent user signups
    const recentUsers = db.prepare(`
      SELECT id, name, email, role, created_at
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `).all();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalTrips,
        totalStops,
        totalActivities,
        totalExpenses
      },
      popularDestinations,
      topActivityCategories,
      recentUsers
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/users
 * Admin view of platform users.
 */
export function getAllUsers(req, res, next) {
  try {
    const users = db.prepare(`
      SELECT id, name, email, avatar_url, bio, currency, language, role, created_at
      FROM users
      ORDER BY created_at DESC
    `).all();

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/users/:id/role
 * Admin management action: Update user role ('user' vs 'admin').
 */
export function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'user' or 'admin'." });
    }

    const info = db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(role, id);
    if (info.changes === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.status(200).json({
      success: true,
      message: `User role updated to '${role}'.`
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/destinations/:id
 * Admin content management action to delete destination.
 */
export function deletePlatformDestination(req, res, next) {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM destinations WHERE id = ?').run(id);

    res.status(200).json({
      success: true,
      message: 'Destination deleted from platform catalog.'
    });
  } catch (err) {
    next(err);
  }
}
