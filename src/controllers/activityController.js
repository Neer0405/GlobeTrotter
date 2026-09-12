import db from '../config/database.js';

/**
 * GET /api/activities
 * Filters activities by category, max_cost, duration, and search term.
 */
export function searchActivities(req, res, next) {
  try {
    const { category, max_cost, duration, search } = req.query;

    let query = 'SELECT * FROM activities WHERE 1=1';
    const params = [];

    if (search && search.trim() !== '') {
      query += ' AND (title LIKE ? OR city_name LIKE ? OR country LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (category && category !== 'all') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (max_cost && !isNaN(parseFloat(max_cost))) {
      query += ' AND cost <= ?';
      params.push(parseFloat(max_cost));
    }

    if (duration && duration !== 'all') {
      query += ' AND duration LIKE ?';
      params.push(`%${duration}%`);
    }

    query += ' ORDER BY rating DESC, title ASC';

    const activities = db.prepare(query).all(...params);

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/activities/:id
 * Detailed preview modal endpoint.
 */
export function getActivityById(req, res, next) {
  try {
    const { id } = req.params;
    const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(id);

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found.' });
    }

    res.status(200).json({
      success: true,
      activity
    });
  } catch (err) {
    next(err);
  }
}
