import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const getAdminStats = async (_req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const totalTrips = await prisma.trip.count();
    const totalStops = await prisma.stop.count();
    const totalCities = await prisma.city.count();
    const totalActivities = await prisma.activity.count();

    // Most popular cities in stops
    const stopsGrouped = await prisma.stop.groupBy({
      by: ['city_id'],
      _count: { city_id: true },
      orderBy: { _count: { city_id: 'desc' } },
      take: 5,
    });

    const topCityDetails = await Promise.all(
      stopsGrouped.map(async (sg) => {
        const city = await prisma.city.findUnique({ where: { id: sg.city_id } });
        return {
          city: city?.name || 'Unknown',
          country: city?.country || 'Unknown',
          stopsCount: sg._count.city_id,
        };
      })
    );

    // Recent Trips
    const recentTrips = await prisma.trip.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { stops: true } },
      },
    });

    return res.json({
      stats: {
        totalUsers,
        totalTrips,
        totalStops,
        totalCities,
        totalActivities,
      },
      topCities: topCityDetails,
      recentTrips,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ message: 'Error retrieving admin statistics.' });
  }
};
