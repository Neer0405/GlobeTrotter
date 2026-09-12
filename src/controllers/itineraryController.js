import db from '../config/database.js';

/**
 * GET /api/trips/:trip_id/stops
 * Returns all city stops for a trip ordered by stop_order.
 */
export function getTripStops(req, res, next) {
  try {
    const { trip_id } = req.params;
    const userId = req.user.id;

    const trip = db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const stops = db.prepare('SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY stop_order ASC').all(trip_id);

    res.status(200).json({
      success: true,
      count: stops.length,
      stops
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/trips/:trip_id/stops
 * Adds a new city stop to a trip.
 */
export function addTripStop(req, res, next) {
  try {
    const { trip_id } = req.params;
    const userId = req.user.id;
    const { city_name, country, arrival_date, departure_date, stay_days } = req.body;

    if (!city_name || !country || !arrival_date || !departure_date) {
      return res.status(400).json({
        success: false,
        message: 'City name, country, arrival date, and departure date are required.'
      });
    }

    const trip = db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    // Determine stop order
    const maxOrderRow = db.prepare('SELECT MAX(stop_order) as max_order FROM trip_stops WHERE trip_id = ?').get(trip_id);
    const stop_order = (maxOrderRow && maxOrderRow.max_order !== null) ? maxOrderRow.max_order + 1 : 1;
    const days = stay_days ? parseInt(stay_days, 10) : 1;

    const stmt = db.prepare(`
      INSERT INTO trip_stops (trip_id, city_name, country, arrival_date, departure_date, stay_days, stop_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(trip_id, city_name, country, arrival_date, departure_date, days, stop_order);

    // Update stop_count on trips table
    const stopCount = db.prepare('SELECT COUNT(*) as count FROM trip_stops WHERE trip_id = ?').get(trip_id).count;
    db.prepare('UPDATE trips SET stop_count = ? WHERE id = ?').run(stopCount, trip_id);

    const newStop = db.prepare('SELECT * FROM trip_stops WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: `City stop '${city_name}' added to trip! 📍`,
      stop: newStop
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/trips/:trip_id/stops/reorder
 * Reorders city stops using an array of [{ id, stop_order }].
 */
export function reorderTripStops(req, res, next) {
  try {
    const { trip_id } = req.params;
    const userId = req.user.id;
    const { stops } = req.body; // Array of { id, stop_order }

    if (!Array.isArray(stops)) {
      return res.status(400).json({ success: false, message: 'Array of stops with order is required.' });
    }

    const trip = db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const updateStmt = db.prepare('UPDATE trip_stops SET stop_order = ? WHERE id = ? AND trip_id = ?');

    db.transaction(() => {
      for (const item of stops) {
        updateStmt.run(item.stop_order, item.id, trip_id);
      }
    })();

    const updatedStops = db.prepare('SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY stop_order ASC').all(trip_id);

    res.status(200).json({
      success: true,
      message: 'City stops reordered successfully! 🔄',
      stops: updatedStops
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/trips/:trip_id/stops/:stop_id
 * Removes a city stop from trip.
 */
export function deleteTripStop(req, res, next) {
  try {
    const { trip_id, stop_id } = req.params;
    const userId = req.user.id;

    const trip = db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    db.prepare('DELETE FROM trip_stops WHERE id = ? AND trip_id = ?').run(stop_id, trip_id);

    // Recalculate stop_count
    const stopCount = db.prepare('SELECT COUNT(*) as count FROM trip_stops WHERE trip_id = ?').get(trip_id).count;
    db.prepare('UPDATE trips SET stop_count = ? WHERE id = ?').run(stopCount, trip_id);

    res.status(200).json({
      success: true,
      message: 'City stop removed from trip.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/trips/:trip_id/activities
 * Assigns an activity to a specific stop / day.
 */
export function addTripActivity(req, res, next) {
  try {
    const { trip_id } = req.params;
    const userId = req.user.id;
    const { stop_id, day_number, title, location, time_slot, duration, cost, category } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Activity title is required.' });
    }

    const trip = db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const dayNum = day_number ? parseInt(day_number, 10) : 1;
    const actCost = cost ? parseFloat(cost) : 0;
    const actCat = category || 'Sightseeing';

    const stmt = db.prepare(`
      INSERT INTO trip_activities (trip_id, stop_id, day_number, title, location, time_slot, duration, cost, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(trip_id, stop_id || null, dayNum, title, location || null, time_slot || null, duration || null, actCost, actCat);

    const newActivity = db.prepare('SELECT * FROM trip_activities WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Activity assigned to itinerary! 🎟️',
      activity: newActivity
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/trips/:trip_id/activities/:activity_id
 */
export function deleteTripActivity(req, res, next) {
  try {
    const { trip_id, activity_id } = req.params;
    const userId = req.user.id;

    const trip = db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    db.prepare('DELETE FROM trip_activities WHERE id = ? AND trip_id = ?').run(activity_id, trip_id);

    res.status(200).json({
      success: true,
      message: 'Activity removed from itinerary.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/trips/:trip_id/full-itinerary
 * Returns structured day-by-day & city-by-city breakdown with timing, location, cost, and duration tags.
 */
export function getFullItinerary(req, res, next) {
  try {
    const { trip_id } = req.params;
    const userId = req.user.id;

    const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const stops = db.prepare('SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY stop_order ASC').all(trip_id);
    const activities = db.prepare('SELECT * FROM trip_activities WHERE trip_id = ? ORDER BY day_number ASC, time_slot ASC').all(trip_id);

    // Group activities by day_number
    const dayMap = {};
    for (const act of activities) {
      if (!dayMap[act.day_number]) {
        dayMap[act.day_number] = [];
      }
      dayMap[act.day_number].push(act);
    }

    const daysList = Object.keys(dayMap).map(d => ({
      day_number: parseInt(d, 10),
      activities: dayMap[d]
    }));

    const totalActivityCost = activities.reduce((acc, a) => acc + (a.cost || 0), 0);

    res.status(200).json({
      success: true,
      trip,
      stops,
      itineraryDays: daysList,
      totalActivityCost
    });
  } catch (err) {
    next(err);
  }
}
