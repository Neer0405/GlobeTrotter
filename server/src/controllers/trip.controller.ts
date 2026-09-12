import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getTrips = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const trips = await prisma.trip.findMany({
      where: { user_id: userId },
      include: {
        stops: {
          include: {
            city: true,
          },
          orderBy: { order_index: 'asc' },
        },
      },
      orderBy: { start_date: 'asc' },
    });

    const enrichedTrips = await Promise.all(
      trips.map(async (trip) => {
        const budgetItems = await prisma.budgetItem.findMany({ where: { trip_id: trip.id } });
        const stopIds = trip.stops.map((s) => s.id);
        const stopActivities = await prisma.stopActivity.findMany({
          where: { stop_id: { in: stopIds } },
          include: { activity: true },
        });

        const activityTotal = stopActivities.reduce(
          (sum, sa) => sum + (sa.cost_override ?? sa.activity.cost ?? 0),
          0
        );
        const budgetItemsTotal = budgetItems.reduce(
          (sum, item) => sum + (item.actual_cost ?? item.estimated_cost ?? 0),
          0
        );

        return {
          ...trip,
          stops_count: trip.stops.length,
          total_cost: activityTotal + budgetItemsTotal,
        };
      })
    );

    return res.json({ trips: enrichedTrips });
  } catch (error) {
    console.error('Error fetching trips:', error);
    return res.status(500).json({ message: 'Error retrieving trips.' });
  }
};

export const getTripById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        stops: {
          include: {
            city: true,
            stop_activities: {
              include: {
                activity: true,
              },
            },
          },
          orderBy: { order_index: 'asc' },
        },
        budget_items: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found.' });
    }

    if (trip.user_id !== userId && !trip.is_public && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied to this trip.' });
    }

    return res.json({ trip });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving trip details.' });
  }
};

export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, start_date, end_date, description, cover_photo_url, is_public } = req.body;

    if (!name || !start_date || !end_date) {
      return res.status(400).json({ message: 'Trip name, start date, and end date are required.' });
    }

    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid start or end date format.' });
    }
    if (start > end) {
      return res.status(400).json({ message: 'Start date cannot be after end date.' });
    }

    const trip = await prisma.trip.create({
      data: {
        user_id: userId,
        name,
        start_date: start,
        end_date: end,
        description,
        cover_photo_url:
          cover_photo_url ||
          'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000&q=80',
        is_public: Boolean(is_public),
      },
    });

    return res.status(201).json({ trip });
  } catch (error) {
    console.error('Error creating trip:', error);
    return res.status(500).json({ message: 'Error creating trip.' });
  }
};

export const updateTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const existingTrip = await prisma.trip.findUnique({ where: { id } });
    if (!existingTrip) return res.status(404).json({ message: 'Trip not found.' });
    if (existingTrip.user_id !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to edit this trip.' });
    }

    const { name, start_date, end_date, description, cover_photo_url, is_public } = req.body;

    const start = start_date ? new Date(start_date) : new Date(existingTrip.start_date);
    const end = end_date ? new Date(end_date) : new Date(existingTrip.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid start or end date format.' });
    }
    if (start > end) {
      return res.status(400).json({ message: 'Start date cannot be after end date.' });
    }

    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        ...(name && { name }),
        start_date: start,
        end_date: end,
        ...(description !== undefined && { description }),
        ...(cover_photo_url !== undefined && { cover_photo_url }),
        ...(is_public !== undefined && { is_public: Boolean(is_public) }),
      },
    });

    return res.json({ trip: updatedTrip });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating trip.' });
  }
};

export const deleteTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const existingTrip = await prisma.trip.findUnique({ where: { id } });
    if (!existingTrip) return res.status(404).json({ message: 'Trip not found.' });
    if (existingTrip.user_id !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this trip.' });
    }

    await prisma.trip.delete({ where: { id } });
    return res.json({ message: 'Trip deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting trip.' });
  }
};

export const uploadCoverPhoto = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    return res.json({ url: fileUrl });
  } catch (error) {
    return res.status(500).json({ message: 'Error uploading image.' });
  }
};

export const getPublicTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        user: {
          select: { name: true, photo_url: true },
        },
        stops: {
          include: {
            city: true,
            stop_activities: {
              include: { activity: true },
            },
          },
          orderBy: { order_index: 'asc' },
        },
        budget_items: true,
      },
    });

    if (!trip) {
      return res.status(404).json({ message: 'Shared trip not found.' });
    }

    if (!trip.is_public) {
      return res.status(403).json({ message: 'This itinerary is private.' });
    }

    return res.json({ trip });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching shared trip.' });
  }
};

export const copyTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const sourceTrip = await prisma.trip.findUnique({
      where: { id },
      include: {
        stops: {
          include: {
            stop_activities: true,
          },
        },
        budget_items: true,
      },
    });

    if (!sourceTrip) return res.status(404).json({ message: 'Source trip not found.' });
    if (!sourceTrip.is_public && sourceTrip.user_id !== userId) {
      return res.status(403).json({ message: 'Cannot copy private trip.' });
    }

    const clonedTrip = await prisma.trip.create({
      data: {
        user_id: userId,
        name: `Copy of ${sourceTrip.name}`,
        start_date: sourceTrip.start_date,
        end_date: sourceTrip.end_date,
        description: sourceTrip.description,
        cover_photo_url: sourceTrip.cover_photo_url,
        is_public: false,
      },
    });

    for (const stop of sourceTrip.stops) {
      const newStop = await prisma.stop.create({
        data: {
          trip_id: clonedTrip.id,
          city_id: stop.city_id,
          order_index: stop.order_index,
          arrival_date: stop.arrival_date,
          departure_date: stop.departure_date,
        },
      });

      for (const sa of stop.stop_activities) {
        await prisma.stopActivity.create({
          data: {
            stop_id: newStop.id,
            activity_id: sa.activity_id,
            scheduled_date: sa.scheduled_date,
            scheduled_time: sa.scheduled_time,
            cost_override: sa.cost_override,
            notes: sa.notes,
          },
        });
      }
    }

    for (const bi of sourceTrip.budget_items) {
      await prisma.budgetItem.create({
        data: {
          trip_id: clonedTrip.id,
          category: bi.category,
          name: bi.name,
          estimated_cost: bi.estimated_cost,
          actual_cost: bi.actual_cost,
          notes: bi.notes,
        },
      });
    }

    return res.status(201).json({
      message: 'Trip cloned successfully!',
      trip: clonedTrip,
    });
  } catch (error) {
    console.error('Error copying trip:', error);
    return res.status(500).json({ message: 'Error copying trip.' });
  }
};
