import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding dummy trips and cities...');

  const users = await prisma.user.findMany();
  if (users.length === 0) {
    console.error('No users found in database to attach trips to.');
    process.exit(1);
  }

  // 2. Safely add cities (upsert based on name)
  const citiesData = [
    {
      name: 'Paris',
      country: 'France',
      region: 'Europe',
      cost_index: 4.5,
      popularity_score: 98,
      image_url: 'https://loremflickr.com/800/600/paris,city',
      description: 'The City of Light, world-renowned for art, fashion, gastronomy, and iconic architecture.',
      activities: [
        { name: 'Eiffel Tower Sunset Experience', category: 'Sightseeing', cost: 35, duration_minutes: 150, description: 'Summit access with panoramic views of Paris. Experience the magic of the city as it illuminates in the evening.', image_url: 'https://loremflickr.com/600/400/eiffeltower,paris' },
        { name: 'Louvre Museum Guided Tour', category: 'Culture', cost: 50, duration_minutes: 180, description: 'Explore Mona Lisa and classic masterworks with expert commentary. Dive deep into world art history.', image_url: 'https://loremflickr.com/600/400/louvre,museum' },
      ],
    },
    {
      name: 'Bali',
      country: 'Indonesia',
      region: 'Asia',
      cost_index: 2.2,
      popularity_score: 94,
      image_url: 'https://loremflickr.com/800/600/bali,indonesia',
      description: 'Tropical paradise of lush rice terraces, sacred temples, surf beaches, and spiritual wellness.',
      activities: [
        { name: 'Ubud Rice Terrace Excursion', category: 'Adventure', cost: 25, duration_minutes: 180, description: 'Tegalalang rice paddies, coffee plantations, and swings. A perfect blend of nature and thrill.', image_url: 'https://loremflickr.com/600/400/bali,riceterrace' },
        { name: 'Uluwatu Sunset Temple', category: 'Culture', cost: 18, duration_minutes: 150, description: 'Dramatic cliffside temple performance against ocean sunset.', image_url: 'https://loremflickr.com/600/400/uluwatu,temple' },
      ],
    }
  ];

  for (const cData of citiesData) {
    const { activities, ...cityFields } = cData;
    
    // Check if city exists
    let city = await prisma.city.findFirst({ where: { name: cityFields.name } });
    if (!city) {
      city = await prisma.city.create({
        data: {
          ...cityFields,
          activities: {
            create: activities,
          },
        },
      });
      console.log(`Added missing city: ${city.name}`);
    }
  }

  // 3. Create Dummy Trips for ALL users
  const paris = await prisma.city.findFirst({ where: { name: 'Paris' } });
  const bali = await prisma.city.findFirst({ where: { name: 'Bali' } });

  for (const user of users) {
    if (paris) {
      const parisTrip = await prisma.trip.create({
        data: {
          user_id: user.id,
          name: 'Romantic Paris Getaway',
          start_date: new Date(Date.now() + 86400000 * 30), // In 30 days
          end_date: new Date(Date.now() + 86400000 * 35),
          description: 'A 5-day romantic escape to the City of Love. Covering all the top monuments and cafes.',
          cover_photo_url: 'https://loremflickr.com/1000/600/paris,eiffeltower',
          is_public: true,
          stops: {
            create: [
              {
                city_id: paris.id,
                order_index: 0,
                arrival_date: new Date(Date.now() + 86400000 * 30),
                departure_date: new Date(Date.now() + 86400000 * 35),
              }
            ]
          }
        }
      });
      console.log(`Created Dummy Trip for user ${user.email}: ${parisTrip.name}`);
    }

    if (bali) {
      const baliTrip = await prisma.trip.create({
        data: {
          user_id: user.id,
          name: 'Bali Wellness Retreat',
          start_date: new Date(Date.now() + 86400000 * 60), // In 60 days
          end_date: new Date(Date.now() + 86400000 * 70),
          description: 'Yoga, surfing, and relaxing in the tropical heaven of Indonesia.',
          cover_photo_url: 'https://loremflickr.com/1000/600/bali,beach',
          is_public: false,
          stops: {
            create: [
              {
                city_id: bali.id,
                order_index: 0,
                arrival_date: new Date(Date.now() + 86400000 * 60),
                departure_date: new Date(Date.now() + 86400000 * 70),
              }
            ]
          }
        }
      });
      console.log(`Created Dummy Trip for user ${user.email}: ${baliTrip.name}`);
    }
  }

  console.log('Finished adding dummy data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
