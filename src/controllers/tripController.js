import db from '../config/database.js';
import crypto from 'crypto';

// Curated Preset Cover Photos for Trip Creator Wizard
export const PRESET_COVER_PHOTOS = [
  { id: 'kyoto', title: 'Kyoto Temples', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80' },
  { id: 'santorini', title: 'Santorini Sunset', url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80' },
  { id: 'banff', title: 'Banff Alpine Lake', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80' },
  { id: 'bali', title: 'Bali Beach Resort', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' },
  { id: 'amalfi', title: 'Amalfi Coast Villa', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80' },
  { id: 'swiss', title: 'Swiss Alps Railway', url: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=800&q=80' },
  { id: 'paris', title: 'Paris Eiffel Tower', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80' },
  { id: 'tokyo', title: 'Tokyo Neon Lights', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80' }
];

/**
 * GET /api/trips/presets/photos
 * Returns preset photo options for the wizard.
 */
export function getPresetCoverPhotos(req, res) {
  res.status(200).json({
    success: true,
    presetPhotos: PRESET_COVER_PHOTOS
  });
}

/**
 * POST /api/trips
 * Creates a new trip plan (Interactive Wizard).
 */
export function createTrip(req, res, next) {
  try {
    const userId = req.user.id;
    const { 
      trip_name,
      destination_title, 
      destination_location, 
      description,
      image_url, 
      cover_photo_url,
      start_date, 
      end_date, 
      total_budget, 
      stop_count,
      status,
      is_public
    } = req.body;

    const title = trip_name || destination_title;
    const location = destination_location || title;

    if (!title || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Trip name, start date, and end date are required.'
      });
    }

    const tripStatus = status || 'upcoming';
    const budget = total_budget ? parseFloat(total_budget) : 0;
    const stops = stop_count ? parseInt(stop_count, 10) : 1;
    const coverUrl = cover_photo_url || image_url || PRESET_COVER_PHOTOS[0].url;
    const shareCode = `trip_${crypto.randomBytes(6).toString('hex')}`;
    const publicFlag = is_public !== undefined ? (is_public ? 1 : 0) : 1;

    const stmt = db.prepare(`
      INSERT INTO trips (
        user_id, trip_name, destination_title, destination_location, description,
        image_url, cover_photo_url, start_date, end_date, total_budget, stop_count, status, is_public, share_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId, title, title, location, description || null,
      coverUrl, coverUrl, start_date, end_date, budget, stops, tripStatus, publicFlag, shareCode
    );

    const newTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Trip plan created successfully! ✈️',
      trip: newTrip
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/trips
 * Returns filterable & searchable list of trips for authenticated user.
 */
export function getUserTrips(req, res, next) {
  try {
    const userId = req.user.id;
    const { search, status } = req.query;

    let query = 'SELECT * FROM trips WHERE user_id = ?';
    const params = [userId];

    if (status && status !== 'all') {
      query += ' AND status = ?';
      params.push(status.toLowerCase());
    }

    if (search && search.trim() !== '') {
      query += ' AND (trip_name LIKE ? OR destination_location LIKE ? OR description LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    query += ' ORDER BY start_date ASC, created_at DESC';

    const trips = db.prepare(query).all(...params);

    res.status(200).json({
      success: true,
      count: trips.length,
      trips
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/trips/:id
 */
export function getTripById(req, res, next) {
  try {
    const userId = req.user.id;
    const tripId = req.params.id;

    const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(tripId, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found.' });
    }

    res.status(200).json({
      success: true,
      trip
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/trips/:id
 * Updates an existing trip plan.
 */
export function updateTrip(req, res, next) {
  try {
    const userId = req.user.id;
    const tripId = req.params.id;
    const { 
      trip_name, 
      destination_location, 
      description, 
      cover_photo_url, 
      start_date, 
      end_date, 
      total_budget, 
      stop_count, 
      status 
    } = req.body;

    const existing = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(tripId, userId);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const updatedName = trip_name !== undefined ? trip_name : existing.trip_name;
    const updatedLoc = destination_location !== undefined ? destination_location : existing.destination_location;
    const updatedDesc = description !== undefined ? description : existing.description;
    const updatedPhoto = cover_photo_url !== undefined ? cover_photo_url : existing.cover_photo_url;
    const updatedStart = start_date !== undefined ? start_date : existing.start_date;
    const updatedEnd = end_date !== undefined ? end_date : existing.end_date;
    const updatedBudget = total_budget !== undefined ? parseFloat(total_budget) : existing.total_budget;
    const updatedStops = stop_count !== undefined ? parseInt(stop_count, 10) : existing.stop_count;
    const updatedStatus = status !== undefined ? status : existing.status;

    db.prepare(`
      UPDATE trips SET 
        trip_name = ?, 
        destination_title = ?, 
        destination_location = ?, 
        description = ?, 
        image_url = ?, 
        cover_photo_url = ?, 
        start_date = ?, 
        end_date = ?, 
        total_budget = ?, 
        stop_count = ?, 
        status = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(
      updatedName, updatedName, updatedLoc, updatedDesc, 
      updatedPhoto, updatedPhoto, updatedStart, updatedEnd, 
      updatedBudget, updatedStops, updatedStatus, tripId, userId
    );

    const updatedTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(tripId);

    res.status(200).json({
      success: true,
      message: 'Trip updated successfully! 📝',
      trip: updatedTrip
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/trips/share/:share_code
 * Public route to view a shared trip plan along with stops and activities.
 */
export function getSharedTrip(req, res, next) {
  try {
    const { share_code } = req.params;
    const trip = db.prepare(`
      SELECT t.*, u.name as owner_name, u.avatar_url as owner_avatar
      FROM trips t
      JOIN users u ON t.user_id = u.id
      WHERE t.share_code = ? AND t.is_public = 1
    `).get(share_code);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Shared trip not found or private.' });
    }

    const stops = db.prepare('SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY stop_order ASC').all(trip.id);
    const activities = db.prepare('SELECT * FROM trip_activities WHERE trip_id = ? ORDER BY day_number ASC, time_slot ASC').all(trip.id);

    res.status(200).json({
      success: true,
      trip,
      stops,
      activities
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/trips/share/:share_code/clone
 * Deep-clones a public itinerary to the authenticated user's account ("Copy Trip to My Account").
 */
export function cloneSharedTrip(req, res, next) {
  try {
    const userId = req.user.id;
    const { share_code } = req.params;

    const sourceTrip = db.prepare(`
      SELECT * FROM trips WHERE share_code = ? AND is_public = 1
    `).get(share_code);

    if (!sourceTrip) {
      return res.status(404).json({ success: false, message: 'Public trip not found or private.' });
    }

    const newShareCode = `trip_${crypto.randomBytes(6).toString('hex')}`;
    const newTitle = `${sourceTrip.trip_name || sourceTrip.destination_title} (Copy)`;

    // Insert cloned trip
    const tripStmt = db.prepare(`
      INSERT INTO trips (
        user_id, trip_name, destination_title, destination_location, description,
        image_url, cover_photo_url, start_date, end_date, total_budget, stop_count, status, is_public, share_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'upcoming', 1, ?)
    `);

    const tripResult = tripStmt.run(
      userId,
      newTitle,
      newTitle,
      sourceTrip.destination_location,
      sourceTrip.description,
      sourceTrip.image_url,
      sourceTrip.cover_photo_url,
      sourceTrip.start_date,
      sourceTrip.end_date,
      sourceTrip.total_budget,
      sourceTrip.stop_count,
      newShareCode
    );

    const newTripId = tripResult.lastInsertRowid;

    // Clone stops
    const sourceStops = db.prepare('SELECT * FROM trip_stops WHERE trip_id = ?').all(sourceTrip.id);
    const stopMap = {}; // Maps old stop_id -> new stop_id

    const stopInsertStmt = db.prepare(`
      INSERT INTO trip_stops (trip_id, city_name, country, arrival_date, departure_date, stay_days, stop_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    for (const s of sourceStops) {
      const resStop = stopInsertStmt.run(
        newTripId,
        s.city_name,
        s.country,
        s.arrival_date,
        s.departure_date,
        s.stay_days,
        s.stop_order
      );
      stopMap[s.id] = resStop.lastInsertRowid;
    }

    // Clone activities
    const sourceActivities = db.prepare('SELECT * FROM trip_activities WHERE trip_id = ?').all(sourceTrip.id);
    const actInsertStmt = db.prepare(`
      INSERT INTO trip_activities (trip_id, stop_id, day_number, title, location, time_slot, duration, cost, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const a of sourceActivities) {
      const newStopId = a.stop_id ? (stopMap[a.stop_id] || null) : null;
      actInsertStmt.run(
        newTripId,
        newStopId,
        a.day_number,
        a.title,
        a.location,
        a.time_slot,
        a.duration,
        a.cost,
        a.category
      );
    }

    const clonedTrip = db.prepare('SELECT * FROM trips WHERE id = ?').get(newTripId);

    res.status(201).json({
      success: true,
      message: `Trip '${clonedTrip.trip_name}' copied to your account! ✈️`,
      trip: clonedTrip
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/trips/:id
 */
export function deleteTrip(req, res, next) {
  try {
    const userId = req.user.id;
    const tripId = req.params.id;

    const info = db.prepare('DELETE FROM trips WHERE id = ? AND user_id = ?').run(tripId, userId);
    if (info.changes === 0) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    res.status(200).json({
      success: true,
      message: 'Trip plan deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

