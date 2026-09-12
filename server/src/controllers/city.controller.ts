import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { geminiService } from '../services/gemini.service';

export const getCities = async (req: Request, res: Response) => {
  try {
    const { search, country, region, minCost, maxCost } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { country: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    if (country) {
      where.country = { contains: String(country) };
    }

    if (region) {
      where.region = { contains: String(region) };
    }

    if (minCost || maxCost) {
      where.cost_index = {
        ...(minCost && { gte: Number(minCost) }),
        ...(maxCost && { lte: Number(maxCost) }),
      };
    }

    const cities = await prisma.city.findMany({
      where,
      include: {
        _count: {
          select: { activities: true },
        },
      },
      orderBy: { popularity_score: 'desc' },
    });

    return res.json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    return res.status(500).json({ message: 'Error searching cities.' });
  }
};

export const getCityById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const city = await prisma.city.findUnique({
      where: { id },
      include: {
        activities: true,
      },
    });

    if (!city) return res.status(404).json({ message: 'City not found.' });
    return res.json({ city });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving city details.' });
  }
};

export const syncCity = async (req: Request, res: Response) => {
  try {
    const { name, country, region, activities, description: bodyDescription } = req.body;
    
    if (!name || !country) {
      return res.status(400).json({ message: 'Name and country are required.' });
    }

    // Try to find if we already have this city saved
    let city = await prisma.city.findFirst({
      where: {
        name: { equals: name },
        country: { equals: country }
      }
    });

    // If not, create a new entry for this dynamic city
    if (!city) {
      let description = bodyDescription || `Explore the beautiful city of ${name}, ${country}.`;
      let activitiesToCreate: any[] = activities ? activities.map((a: any) => ({
        name: a.name,
        category: a.category,
        cost: a.cost || 0,
        duration_minutes: a.duration_minutes || 60,
        description: a.description,
        image_url: `https://loremflickr.com/600/400/${encodeURIComponent(a.image_tag || name)}`
      })) : [];
      
      if (!activities) {
        try {
          const aiDetails = await geminiService.generateCityDetails(name, country);
          if (aiDetails && aiDetails.description && !bodyDescription) {
            description = aiDetails.description;
          }
          if (aiDetails && aiDetails.activities && Array.isArray(aiDetails.activities)) {
            activitiesToCreate = aiDetails.activities.map((a: any) => ({
              name: a.name,
              category: a.category,
              cost: a.cost || 0,
              duration_minutes: a.duration_minutes || 60,
              description: a.description,
              image_url: `https://loremflickr.com/600/400/${encodeURIComponent(a.image_tag || name)}`
            }));
          }
        } catch (aiErr) {
          console.error('AI enrichment failed during sync:', aiErr);
        }
      }
      
      city = await prisma.city.create({
        data: {
          name,
          country,
          region: region || 'Global',
          cost_index: 3.0, // Default average
          popularity_score: 50, // Default for dynamic cities
          image_url: `https://loremflickr.com/600/400/${encodeURIComponent(name)},city,travel`,
          description,
          activities: activitiesToCreate.length > 0 ? {
            create: activitiesToCreate
          } : undefined
        }
      });
    }

    return res.json({ city });
  } catch (error) {
    console.error('Error syncing dynamic city:', error);
    return res.status(500).json({ message: 'Error syncing dynamic city.' });
  }
};

const CITY_IMAGE_MAP: Record<string, string> = {
  // Goa & Beaches
  'panaji': 'https://images.unsplash.com/photo-1587922546307-776227941871?w=800&q=80',
  'palolem': 'https://images.unsplash.com/photo-1512343800234-88253219859e?w=800&q=80',
  'anjuna': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
  'calangute': 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800&q=80',
  'baga': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'candolim': 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
  'old goa': 'https://images.unsplash.com/photo-1600100397608-f09070624d25?w=800&q=80',
  'margao': 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=800&q=80',
  'vasco da gama': 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80',

  // Major Indian Cities
  'mumbai': 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80',
  'new delhi': 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
  'jaipur': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800&q=80',
  'agra': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
  'bengaluru': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&q=80',
  'udaipur': 'https://images.unsplash.com/photo-1615836245337-f5b9b2303f1c?w=800&q=80',
  'varanasi': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&q=80',
  'kochi': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&q=80',

  // Major Global Cities
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
  'kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
  'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
  'new york city': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
  'barcelona': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
  'santorini': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
  'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  'sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80',
  'cape town': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80',
};

const UNSPLASH_FALLBACKS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=800&q=80',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&q=80',
  'https://images.unsplash.com/photo-1512343800234-88253219859e?w=800&q=80',
];

const ACTIVITY_IMAGE_FALLBACKS: Record<string, string[]> = {
  Food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  ],
  Sightseeing: [
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80',
  ],
  Culture: [
    'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&q=80',
  ],
  Adventure: [
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  ],
  Relaxation: [
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
  ]
};

function getCityImageUrl(cityName: string, idx: number): string {
  const key = cityName.toLowerCase().trim();
  if (CITY_IMAGE_MAP[key]) return CITY_IMAGE_MAP[key];
  return UNSPLASH_FALLBACKS[idx % UNSPLASH_FALLBACKS.length];
}

function getActivityImageUrl(category: string, actIdx: number): string {
  const pool = ACTIVITY_IMAGE_FALLBACKS[category] || ACTIVITY_IMAGE_FALLBACKS.Sightseeing;
  return pool[actIdx % pool.length];
}

export const inspireDestinations = async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });

    const destinations = await geminiService.inspireDestinations(prompt);
    
    // Map them to look like standard City objects, cross-referencing DB and ensuring unique photos
    const mappedCities = await Promise.all(
      destinations.map(async (d: any, idx: number) => {
        // Check if city exists in DB
        const dbCity = await prisma.city.findFirst({
          where: { name: d.name },
        });

        const imageUrl = dbCity?.image_url || getCityImageUrl(d.name, idx);

        return {
          id: dbCity?.id || `ai_${idx}_${Date.now()}`,
          name: dbCity?.name || d.name,
          country: dbCity?.country || d.country,
          region: dbCity?.region || d.region,
          cost_index: dbCity?.cost_index || d.cost_index || 3,
          popularity_score: dbCity?.popularity_score || d.popularity_score || 80,
          description: dbCity?.description || d.description,
          image_url: imageUrl,
          activities: (d.activities || []).map((a: any, aIdx: number) => ({
            id: `ai_act_${idx}_${aIdx}_${Date.now()}`,
            name: a.name,
            category: a.category || 'Sightseeing',
            cost: a.cost || a.estimated_cost || 0,
            duration_minutes: a.duration_minutes || 60,
            description: a.description,
            image_url: getActivityImageUrl(a.category || 'Sightseeing', aIdx + idx * 3),
          })),
          _count: { activities: (d.activities || []).length }
        };
      })
    );

    return res.json({ cities: mappedCities });
  } catch (error) {
    console.error('Error in inspireDestinations:', error);
    return res.status(500).json({ message: 'Failed to generate AI destinations.' });
  }
};
