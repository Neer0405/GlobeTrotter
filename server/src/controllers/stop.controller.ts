import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const addStop = async (req: AuthRequest, res: Response) => {
  try {
    const { id: tripId } = req.params; // trip_id
    const { city_id, arrival_date, departure_date } = req.body;

    if (!city_id || !arrival_date || !departure_date) {
      return res.status(400).json({ message: 'City ID, arrival date, and departure date are required.' });
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) return res.status(404).json({ message: 'Trip not found.' });

    const arrival = new Date(arrival_date);
    const departure = new Date(departure_date);
    if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
      return res.status(400).json({ message: 'Invalid arrival or departure date format.' });
    }
    if (arrival > departure) {
      return res.status(400).json({ message: 'Arrival date cannot be after departure date.' });
    }

    const tripStart = new Date(trip.start_date);
    const tripEnd = new Date(trip.end_date);
    if (arrival < tripStart || arrival > tripEnd || departure < tripStart || departure > tripEnd) {
      return res.status(400).json({
        message: `Stop dates must fall within the trip dates: ${trip.start_date.toISOString().split('T')[0]} to ${trip.end_date.toISOString().split('T')[0]}`
      });
    }

    const existingStopsCount = await prisma.stop.count({ where: { trip_id: tripId } });

    const stop = await prisma.stop.create({
      data: {
        trip_id: tripId,
        city_id,
        order_index: existingStopsCount,
        arrival_date: arrival,
        departure_date: departure,
      },
      include: {
        city: true,
        stop_activities: {
          include: { activity: true },
        },
      },
    });

    return res.status(201).json({ stop });
  } catch (error) {
    console.error('Error adding stop:', error);
    return res.status(500).json({ message: 'Error adding stop to trip.' });
  }
};

export const updateStop = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { arrival_date, departure_date, order_index } = req.body;

    const stopExists = await prisma.stop.findUnique({
      where: { id },
      include: { trip: true }
    });
    if (!stopExists) return res.status(404).json({ message: 'Stop not found.' });

    const arrival = arrival_date ? new Date(arrival_date) : new Date(stopExists.arrival_date);
    const departure = departure_date ? new Date(departure_date) : new Date(stopExists.departure_date);

    if (isNaN(arrival.getTime()) || isNaN(departure.getTime())) {
      return res.status(400).json({ message: 'Invalid arrival or departure date format.' });
    }
    if (arrival > departure) {
      return res.status(400).json({ message: 'Arrival date cannot be after departure date.' });
    }

    const tripStart = new Date(stopExists.trip.start_date);
    const tripEnd = new Date(stopExists.trip.end_date);
    if (arrival < tripStart || arrival > tripEnd || departure < tripStart || departure > tripEnd) {
      return res.status(400).json({
        message: `Stop dates must fall within the trip dates: ${stopExists.trip.start_date.toISOString().split('T')[0]} to ${stopExists.trip.end_date.toISOString().split('T')[0]}`
      });
    }

    const stop = await prisma.stop.update({
      where: { id },
      data: {
        arrival_date: arrival,
        departure_date: departure,
        ...(order_index !== undefined && { order_index: Number(order_index) }),
      },
      include: {
        city: true,
        stop_activities: { include: { activity: true } },
      },
    });

    return res.json({ stop });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating stop.' });
  }
};

export const deleteStop = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.stop.delete({ where: { id } });
    return res.json({ message: 'Stop removed from trip.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting stop.' });
  }
};

export const addActivityToStop = async (req: AuthRequest, res: Response) => {
  try {
    const { id: stopId } = req.params;
    const { activity_id, scheduled_date, scheduled_time, cost_override, notes } = req.body;

    if (!activity_id) {
      return res.status(400).json({ message: 'Activity ID is required.' });
    }

    const stop = await prisma.stop.findUnique({ where: { id: stopId } });
    if (!stop) return res.status(404).json({ message: 'Stop not found.' });

    if (scheduled_date) {
      const sDate = new Date(scheduled_date);
      if (isNaN(sDate.getTime())) {
        return res.status(400).json({ message: 'Invalid scheduled date format.' });
      }
      const arrival = new Date(stop.arrival_date);
      const departure = new Date(stop.departure_date);
      if (sDate < arrival || sDate > departure) {
        return res.status(400).json({
          message: `Activity date must be between the stop's arrival (${stop.arrival_date.toISOString().split('T')[0]}) and departure (${stop.departure_date.toISOString().split('T')[0]}) dates.`
        });
      }
    }

    const stopActivity = await prisma.stopActivity.create({
      data: {
        stop_id: stopId,
        activity_id,
        scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
        scheduled_time,
        cost_override: cost_override !== undefined ? Number(cost_override) : null,
        notes,
      },
      include: {
        activity: true,
      },
    });

    return res.status(201).json({ stopActivity });
  } catch (error) {
    console.error('Error adding activity to stop:', error);
    return res.status(500).json({ message: 'Error attaching activity to stop.' });
  }
};

export const updateStopActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduled_date, scheduled_time, cost_override, notes } = req.body;

    const saExists = await prisma.stopActivity.findUnique({
      where: { id },
      include: { stop: true }
    });
    if (!saExists) return res.status(404).json({ message: 'Scheduled activity not found.' });

    if (scheduled_date) {
      const sDate = new Date(scheduled_date);
      if (isNaN(sDate.getTime())) {
        return res.status(400).json({ message: 'Invalid scheduled date format.' });
      }
      const arrival = new Date(saExists.stop.arrival_date);
      const departure = new Date(saExists.stop.departure_date);
      if (sDate < arrival || sDate > departure) {
        return res.status(400).json({
          message: `Activity date must be between the stop's arrival (${saExists.stop.arrival_date.toISOString().split('T')[0]}) and departure (${saExists.stop.departure_date.toISOString().split('T')[0]}) dates.`
        });
      }
    }

    const updated = await prisma.stopActivity.update({
      where: { id },
      data: {
        ...(scheduled_date !== undefined && {
          scheduled_date: scheduled_date ? new Date(scheduled_date) : null,
        }),
        ...(scheduled_time !== undefined && { scheduled_time }),
        ...(cost_override !== undefined && { cost_override: Number(cost_override) }),
        ...(notes !== undefined && { notes }),
      },
      include: { activity: true },
    });

    return res.json({ stopActivity: updated });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating scheduled activity.' });
  }
};

export const deleteStopActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.stopActivity.delete({ where: { id } });
    return res.json({ message: 'Activity removed from stop.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error removing activity from stop.' });
  }
};

export const reorderStops = async (req: AuthRequest, res: Response) => {
  try {
    const { stops } = req.body; // Array of { id, order_index }
    if (!Array.isArray(stops)) {
      return res.status(400).json({ message: 'Stops must be an array of objects.' });
    }

    await Promise.all(
      stops.map((s: { id: string; order_index: number }) =>
        prisma.stop.update({
          where: { id: s.id },
          data: { order_index: s.order_index },
        })
      )
    );

    return res.json({ message: 'Stops reordered successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error reordering stops.' });
  }
};
