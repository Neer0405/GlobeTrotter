import db from '../config/database.js';

/**
 * GET /api/dashboard/summary
 * Returns personalized welcome greeting, user details, quick stats, and recent trips carousel/grid.
 */
export function getDashboardSummary(req, res, next) {
  try {
    const userId = req.user.id;

    // Fetch user profile details
    const user = db.prepare('SELECT id, name, email, avatar_url, bio, role, created_at FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Quick Stats Calculation
    const totalTripsRow = db.prepare('SELECT COUNT(*) as count FROM trips WHERE user_id = ?').get(userId);
    const totalTrips = totalTripsRow ? totalTripsRow.count : 0;

    const totalBudgetRow = db.prepare('SELECT SUM(total_budget) as total FROM trips WHERE user_id = ?').get(userId);
    const totalBudgetSpent = totalBudgetRow && totalBudgetRow.total ? totalBudgetRow.total : 0;

    const upcomingTripsRow = db.prepare("SELECT COUNT(*) as count FROM trips WHERE user_id = ? AND status = 'upcoming'").get(userId);
    const upcomingTripsCount = upcomingTripsRow ? upcomingTripsRow.count : 0;

    // Recent Trips Carousel / Grid (Latest 6 trips)
    const recentTrips = db.prepare(`
      SELECT id, destination_title, destination_location, image_url, start_date, end_date, total_budget, status, created_at
      FROM trips
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 6
    `).all(userId);

    const firstName = user.name ? user.name.split(' ')[0] : 'Traveler';

    res.status(200).json({
      success: true,
      welcomeMessage: `Welcome back, ${firstName}! ✨`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar_url: user.avatar_url,
        bio: user.bio,
        role: user.role
      },
      quickStats: {
        totalTrips,
        totalBudgetSpent,
        upcomingTripsCount
      },
      recentTrips
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/dashboard/recommendations
 * Returns recommended global destinations with popular activity highlights.
 */
export function getRecommendations(req, res, next) {
  try {
    const destinations = db.prepare(`
      SELECT id, title, location, region, category, vibe, price, rating, image_url, description
      FROM destinations
      WHERE is_featured = 1
      ORDER BY rating DESC
      LIMIT 6
    `).all();

    const getActivities = db.prepare(`
      SELECT id, title, category, estimated_cost
      FROM destination_activities
      WHERE destination_id = ?
    `);

    const recommendations = destinations.map(dest => ({
      ...dest,
      activities: getActivities.all(dest.id)
    }));

    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (err) {
    next(err);
  }
}
