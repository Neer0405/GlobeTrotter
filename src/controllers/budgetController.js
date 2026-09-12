import db from '../config/database.js';

/**
 * GET /api/trips/:trip_id/budget-analytics
 * Financial analytics dashboard:
 * - Category breakdown totals (Transport, Accommodation, Activities, Food/Dining)
 * - Daily average expenditure calculation
 * - Total spent vs target total budget
 * - Smart Budget Alerts (highlights days exceeding target daily budget)
 */
export function getBudgetAnalytics(req, res, next) {
  try {
    const { trip_id } = req.params;
    const userId = req.user.id;

    const trip = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    // Get expenses logged in trip_expenses
    const expenses = db.prepare('SELECT * FROM trip_expenses WHERE trip_id = ? ORDER BY day_number ASC').all(trip_id);

    // Get activities logged in trip_activities
    const activities = db.prepare('SELECT * FROM trip_activities WHERE trip_id = ?').all(trip_id);

    // Calculate total duration in days
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const diffTime = Math.abs(end - start);
    const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    // Category breakdown totals
    const categoryTotals = {
      Transport: 0,
      Accommodation: 0,
      Activities: 0,
      'Food/Dining': 0,
      Other: 0
    };

    // Day expenditure map
    const dayExpenditures = {};

    for (let i = 1; i <= totalDays; i++) {
      dayExpenditures[i] = 0;
    }

    // Process trip_expenses
    for (const exp of expenses) {
      const cat = categoryTotals.hasOwnProperty(exp.category) ? exp.category : 'Other';
      categoryTotals[cat] += exp.amount;

      if (!dayExpenditures[exp.day_number]) dayExpenditures[exp.day_number] = 0;
      dayExpenditures[exp.day_number] += exp.amount;
    }

    // Process trip_activities as 'Activities' category
    for (const act of activities) {
      categoryTotals['Activities'] += (act.cost || 0);

      const dNum = act.day_number || 1;
      if (!dayExpenditures[dNum]) dayExpenditures[dNum] = 0;
      dayExpenditures[dNum] += (act.cost || 0);
    }

    const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const dailyAverage = totalDays > 0 ? totalSpent / totalDays : 0;
    const targetDailyBudget = (trip.total_budget && trip.total_budget > 0) ? (trip.total_budget / totalDays) : 150;

    // Smart Budget Alerts
    const alerts = [];
    Object.keys(dayExpenditures).forEach(day => {
      const dNum = parseInt(day, 10);
      const spentOnDay = dayExpenditures[day];
      if (spentOnDay > targetDailyBudget) {
        alerts.push({
          day_number: dNum,
          spent: spentOnDay,
          targetLimit: Math.round(targetDailyBudget),
          message: `⚠️ Warning: Day ${dNum} expenditure ($${spentOnDay.toLocaleString()}) exceeds your target daily budget ($${Math.round(targetDailyBudget).toLocaleString()})!`
        });
      }
    });

    res.status(200).json({
      success: true,
      tripSummary: {
        trip_id: trip.id,
        trip_name: trip.trip_name || trip.destination_title,
        total_budget: trip.total_budget || 0,
        totalSpent,
        remainingBudget: (trip.total_budget || 0) - totalSpent,
        totalDays,
        dailyAverage: Math.round(dailyAverage * 100) / 100,
        targetDailyBudget: Math.round(targetDailyBudget * 100) / 100
      },
      categoryTotals,
      dayExpenditures,
      alerts,
      expenses
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/trips/:trip_id/expenses
 * Add an expense line item to trip.
 */
export function addTripExpense(req, res, next) {
  try {
    const { trip_id } = req.params;
    const userId = req.user.id;
    const { category, amount, day_number, description } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ success: false, message: 'Category and amount are required.' });
    }

    const trip = db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const dayNum = day_number ? parseInt(day_number, 10) : 1;
    const amt = parseFloat(amount);

    const stmt = db.prepare(`
      INSERT INTO trip_expenses (trip_id, category, amount, day_number, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(trip_id, category, amt, dayNum, description || null);

    const newExpense = db.prepare('SELECT * FROM trip_expenses WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Expense added to trip budget! 💳',
      expense: newExpense
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/trips/:trip_id/expenses/:expense_id
 */
export function deleteTripExpense(req, res, next) {
  try {
    const { trip_id, expense_id } = req.params;
    const userId = req.user.id;

    const trip = db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    db.prepare('DELETE FROM trip_expenses WHERE id = ? AND trip_id = ?').run(expense_id, trip_id);

    res.status(200).json({
      success: true,
      message: 'Expense removed from budget.'
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/trips/:trip_id/activities/:activity_id/time
 * Quick inline editing of scheduled time slot & day_number.
 */
export function updateActivityTime(req, res, next) {
  try {
    const { trip_id, activity_id } = req.params;
    const userId = req.user.id;
    const { time_slot, day_number, duration } = req.body;

    const trip = db.prepare('SELECT id FROM trips WHERE id = ? AND user_id = ?').get(trip_id, userId);
    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found or unauthorized.' });
    }

    const activity = db.prepare('SELECT * FROM trip_activities WHERE id = ? AND trip_id = ?').get(activity_id, trip_id);
    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found in trip.' });
    }

    const updatedTime = time_slot !== undefined ? time_slot : activity.time_slot;
    const updatedDay = day_number !== undefined ? parseInt(day_number, 10) : activity.day_number;
    const updatedDuration = duration !== undefined ? duration : activity.duration;

    db.prepare(`
      UPDATE trip_activities 
      SET time_slot = ?, day_number = ?, duration = ?
      WHERE id = ? AND trip_id = ?
    `).run(updatedTime, updatedDay, updatedDuration, activity_id, trip_id);

    const updated = db.prepare('SELECT * FROM trip_activities WHERE id = ?').get(activity_id);

    res.status(200).json({
      success: true,
      message: 'Activity schedule updated! ⏰',
      activity: updated
    });
  } catch (err) {
    next(err);
  }
}
