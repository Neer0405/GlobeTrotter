import { Response } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/auth';

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { name, email, photo_url, language_pref } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(photo_url !== undefined && { photo_url }),
        ...(language_pref && { language_pref }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        photo_url: true,
        language_pref: true,
        role: true,
        saved_cities: true,
      },
    });

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating user profile.' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    await prisma.user.delete({ where: { id: userId } });
    return res.json({ message: 'Account deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting account.' });
  }
};

export const toggleSaveCity = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { cityId } = req.body;

    if (!userId || !cityId) return res.status(400).json({ message: 'City ID required' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    let saved: string[] = [];
    if (user.saved_cities) {
      try {
        saved = JSON.parse(user.saved_cities);
      } catch {
        saved = user.saved_cities.split(',');
      }
    }

    if (saved.includes(cityId)) {
      saved = saved.filter((id) => id !== cityId);
    } else {
      saved.push(cityId);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { saved_cities: JSON.stringify(saved) },
      select: { saved_cities: true },
    });

    return res.json({ saved_cities: updatedUser.saved_cities });
  } catch (error) {
    return res.status(500).json({ message: 'Error saving city.' });
  }
};
