import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding GlobeTrotter database...');

  // Clean existing data
  await prisma.stopActivity.deleteMany();
  await prisma.budgetItem.deleteMany();
  await prisma.stop.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.city.deleteMany();
  await prisma.user.deleteMany();

  // Create Users (Admin & Demo User)
  const passwordHash = await bcrypt.hash('password123', 10);

  const demoUser = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@globetrotter.in',
      password_hash: passwordHash,
      role: 'USER',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
      language_pref: 'en',
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin Explorer',
      email: 'admin@globetrotter.in',
      password_hash: passwordHash,
      role: 'ADMIN',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
      language_pref: 'en',
    },
  });

  console.log('Created Users:', demoUser.email, adminUser.email);

  // Cities Dataset
  const citiesData = [
    {
      name: 'New Delhi',
      country: 'India',
      region: 'North India',
      cost_index: 3.5,
      popularity_score: 95,
      image_url: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
      description: 'The capital city known for its rich history, bustling markets, and iconic monuments.',
      activities: [
        { name: 'Red Fort & Jama Masjid Tour', category: 'Culture', cost: 15, duration_minutes: 180, description: 'Step back in time as you explore the majestic red sandstone walls of the Red Fort, a UNESCO World Heritage site and pinnacle of Mughal architecture. Afterwards, stroll through the vibrant lanes of Old Delhi to visit the grand Jama Masjid, one of the largest mosques in India, and soak in the rich historical atmosphere.', image_url: 'https://loremflickr.com/600/400/redfort,delhi' },
        { name: 'Chandni Chowk Street Food Walk', category: 'Food', cost: 20, duration_minutes: 120, description: 'Embark on a culinary adventure through the bustling, narrow alleys of Chandni Chowk. Treat your taste buds to legendary parathas, sweet jalebis, and fiery chaats from iconic centuries-old vendors while immersing yourself in the chaotic, colorful energy of Old Delhi.', image_url: 'https://loremflickr.com/600/400/streetfood,delhi' },
        { name: 'India Gate Evening Stroll', category: 'Sightseeing', cost: 0, duration_minutes: 90, description: 'Enjoy a leisurely evening walk around the iconic India Gate, a towering war memorial that pays homage to Indian soldiers. As the sun sets, the monument is beautifully illuminated, creating a perfect backdrop for photography and experiencing the lively local crowds that gather around the lawns.', image_url: 'https://loremflickr.com/600/400/indiagate,delhi' },
      ],
    },
    {
      name: 'Mumbai',
      country: 'India',
      region: 'West India',
      cost_index: 4.0,
      popularity_score: 96,
      image_url: 'https://loremflickr.com/800/600/mumbai,city',
      description: 'The financial capital and home of Bollywood, a city that never sleeps.',
      activities: [
        { name: 'Gateway of India Cruise', category: 'Sightseeing', cost: 25, duration_minutes: 120, description: 'Experience the grandeur of Mumbai from the water with a scenic ferry ride starting at the iconic Gateway of India. Sail across the shimmering Arabian Sea while enjoying panoramic views of the city skyline and the historic Taj Mahal Palace Hotel.', image_url: 'https://loremflickr.com/600/400/gatewayofindia,mumbai' },
        { name: 'Marine Drive Sunset', category: 'Sightseeing', cost: 0, duration_minutes: 60, description: 'Take a relaxing sunset stroll along the famous Marine Drive, affectionately known as the Queens Necklace due to its sparkling night-time streetlights. Feel the cool sea breeze and watch the sky transform into vibrant hues of orange and pink over the Arabian Sea.', image_url: 'https://loremflickr.com/600/400/marinedrive,mumbai' },
        { name: 'Elephanta Caves Tour', category: 'Culture', cost: 35, duration_minutes: 240, description: 'Take a boat ride from Mumbai harbor to the serene Elephanta Island to explore its ancient, rock-cut cave temples. Marvel at the intricate, centuries-old sculptures dedicated to Lord Shiva, which offer a profound glimpse into India’s rich spiritual history and artistic heritage.', image_url: 'https://loremflickr.com/600/400/elephanta,caves' },
      ],
    },
    {
      name: 'Jaipur',
      country: 'India',
      region: 'North India',
      cost_index: 3.0,
      popularity_score: 92,
      image_url: 'https://loremflickr.com/800/600/jaipur,city',
      description: 'The Pink City, famous for its magnificent palaces and historic forts.',
      activities: [
        { name: 'Amber Fort Elephant Ride', category: 'Culture', cost: 30, duration_minutes: 180, description: 'Journey to the majestic Amber Fort situated on a rugged hilltop and experience a grand, traditional ascent on elephant back. Explore the forts sprawling courtyards, mirror palaces (Sheesh Mahal), and intricately carved gates that showcase royal Rajput architecture.', image_url: 'https://loremflickr.com/600/400/amberfort,jaipur' },
        { name: 'Hawa Mahal Photography', category: 'Sightseeing', cost: 10, duration_minutes: 60, description: 'Capture the stunning facade of the Hawa Mahal, or Palace of Winds, famous for its intricate pink sandstone honeycomb design. Learn about how royal ladies once used its hundreds of tiny windows to observe street festivals without being seen by the public.', image_url: 'https://loremflickr.com/600/400/hawamahal,jaipur' },
      ],
    },
    {
      name: 'Kochi (Kerala)',
      country: 'India',
      region: 'South India',
      cost_index: 3.2,
      popularity_score: 89,
      image_url: 'https://loremflickr.com/800/600/kochi,kerala',
      description: 'Gateway to God\'s Own Country, blending colonial history with backwaters.',
      activities: [
        { name: 'Houseboat Backwater Cruise', category: 'Adventure', cost: 50, duration_minutes: 360, description: 'Glide peacefully through the tranquil, emerald backwaters of Kerala on a traditional wooden houseboat. Witness the unhurried local village life along the palm-fringed canals while enjoying freshly prepared South Indian delicacies served on board.', image_url: 'https://loremflickr.com/600/400/houseboat,kerala' },
        { name: 'Chinese Fishing Nets Sunset', category: 'Sightseeing', cost: 0, duration_minutes: 60, description: 'Visit the historic shores of Fort Kochi to witness the iconic, massive Chinese fishing nets in action as they are lowered into the sea. The silhouettes of these ancient mechanical nets against a golden tropical sunset make for an unforgettable, picturesque moment.', image_url: 'https://loremflickr.com/600/400/fishingnets,kochi' },
      ],
    },
    {
      name: 'Varanasi',
      country: 'India',
      region: 'North India',
      cost_index: 2.5,
      popularity_score: 90,
      image_url: 'https://loremflickr.com/800/600/varanasi,ghat',
      description: 'The spiritual capital of India along the sacred river Ganges.',
      activities: [
        { name: 'Ganga Aarti Evening Ceremony', category: 'Culture', cost: 10, duration_minutes: 120, description: 'Immerse yourself in the profound spirituality of Varanasi by attending the spectacular evening Ganga Aarti at Dashashwamedh Ghat. Watch priests perform synchronized fire rituals amidst chanting, ringing bells, and thousands of floating oil lamps on the sacred river.', image_url: 'https://loremflickr.com/600/400/gangaaarti,varanasi' },
        { name: 'Sunrise Boat Ride on Ganges', category: 'Sightseeing', cost: 15, duration_minutes: 90, description: 'Experience the mystical awakening of Varanasi with a serene sunrise boat ride on the River Ganges. Float gently past the ancient bathing ghats, observing pilgrims perform morning rituals against the backdrop of ancient temples glowing in the early morning light.', image_url: 'https://loremflickr.com/600/400/ganges,boat' },
      ],
    }
  ];

  for (const cityData of citiesData) {
    const { activities, ...cityFields } = cityData;
    const city = await prisma.city.create({
      data: {
        ...cityFields,
        activities: {
          create: activities,
        },
      },
    });
    console.log(`Created city: ${city.name}`);
  }

  // Create Sample Trips
  const newDelhi = await prisma.city.findFirst({ where: { name: 'New Delhi' } });
  const jaipur = await prisma.city.findFirst({ where: { name: 'Jaipur' } });

  if (newDelhi && jaipur) {
    const trip1 = await prisma.trip.create({
      data: {
        user_id: demoUser.id,
        name: 'Golden Triangle Explorer',
        start_date: new Date(Date.now() + 86400000 * 5),
        end_date: new Date(Date.now() + 86400000 * 11),
        is_public: true,
        stops: {
          create: [
            {
              city_id: newDelhi.id,
              order_index: 0,
              arrival_date: new Date(Date.now() + 86400000 * 5),
              departure_date: new Date(Date.now() + 86400000 * 8),
            },
            {
              city_id: jaipur.id,
              order_index: 1,
              arrival_date: new Date(Date.now() + 86400000 * 8),
              departure_date: new Date(Date.now() + 86400000 * 11),
            }
          ]
        }
      }
    });
    console.log(`Created sample trip: ${trip1.name}`);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
