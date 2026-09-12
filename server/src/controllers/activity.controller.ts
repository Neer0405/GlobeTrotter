import { Request, Response } from 'express';
import { prisma } from '../prisma';

export const getActivities = async (req: Request, res: Response) => {
  try {
    const { city_id, category, type, maxCost, search } = req.query;

    const where: any = {};

    if (city_id) {
      where.city_id = String(city_id);
    }

    const catFilter = category || type;
    if (catFilter && catFilter !== 'All') {
      where.category = String(catFilter);
    }

    if (maxCost) {
      where.cost = { lte: Number(maxCost) };
    }

    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        city: true,
      },
      orderBy: { cost: 'asc' },
    });

    return res.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return res.status(500).json({ message: 'Error retrieving activities.' });
  }
};
