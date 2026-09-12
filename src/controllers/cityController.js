import db from '../config/database.js';

/**
 * GET /api/cities
 * Real-time filtering by search term, country, region, and cost index.
 */
export function searchCities(req, res, next) {
  try {
    const { search, country, region, cost_index } = req.query;

    let query = 'SELECT * FROM cities WHERE 1=1';
    const params = [];

    if (search && search.trim() !== '') {
      query += ' AND (city_name LIKE ? OR country LIKE ? OR description LIKE ? OR popular_spots LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term, term);
    }

    if (country && country !== 'all') {
      query += ' AND country = ?';
      params.push(country);
    }

    if (region && region !== 'all') {
      query += ' AND region = ?';
      params.push(region);
    }

    if (cost_index && cost_index !== 'all') {
      query += ' AND cost_index = ?';
      params.push(cost_index);
    }

    query += ' ORDER BY is_featured DESC, city_name ASC';

    const cities = db.prepare(query).all(...params);

    res.status(200).json({
      success: true,
      count: cities.length,
      cities
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/cities/:id
 */
export function getCityById(req, res, next) {
  try {
    const { id } = req.params;
    const city = db.prepare('SELECT * FROM cities WHERE id = ?').get(id);

    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    res.status(200).json({
      success: true,
      city
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/cities/:id/add-to-trip
 * Quick launch action to add a city directly as a stop to an existing trip.
 */
export function addCityToTrip(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { trip_id, arrival_date, departure_date, stay_days } = req.body;

    const city = db.prepare('SELECT * FROM cities WHERE id = ?').get(id);
    if (!city) {
      return res.status(404).json({ success: false, message: 'City not found.' });
    }

    const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const arrDate = arrival_date || trip.start_date;
    const depDate = departure_date || trip.end_date;
    const days = stay_days ? parseInt(stay_days, 10) : 3;

    const maxOrderRow = db.prepare('SELECT MAX(stop_order) as max_order FROM trip_stops WHERE trip_id = ?').get(trip_id);
    const stop_order = (maxOrderRow && maxOrderRow.max_order !== null) ? maxOrderRow.max_order + 1 : 1;

    const stmt = db.prepare(`
      INSERT INTO trip_stops (trip_id, city_name, country, arrival_date, departure_date, stay_days, stop_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(trip_id, city.city_name, city.country, arrDate, depDate, days, stop_order);

    const stopCount = db.prepare('SELECT COUNT(*) as count FROM trip_stops WHERE trip_id = ?').get(trip_id).count;
    db.prepare('UPDATE trips SET stop_count = ? WHERE id = ?').run(stopCount, trip_id);

    const newStop = db.prepare('SELECT * FROM trip_stops WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: `${city.city_name} added to your trip '${trip.trip_name || trip.destination_title}'! ✈️`,
      stop: newStop
    });
  } catch (err) {
    next(err);
  }
}
