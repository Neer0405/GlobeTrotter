import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store db in data folder
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'globetrotter.db');
const db = new Database(dbPath);

// Enable Foreign Keys & Write-Ahead Logging for speed & safety
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT DEFAULT NULL,
      bio TEXT DEFAULT NULL,
      role TEXT DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      trip_name TEXT,
      destination_title TEXT NOT NULL,
      destination_location TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      cover_photo_url TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      total_budget REAL DEFAULT 0,
      stop_count INTEGER DEFAULT 1,
      status TEXT DEFAULT 'upcoming',
      is_public INTEGER DEFAULT 1,
      share_code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS destinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      region TEXT NOT NULL,
      category TEXT NOT NULL,
      vibe TEXT NOT NULL,
      price REAL NOT NULL,
      rating REAL DEFAULT 4.8,
      image_url TEXT NOT NULL,
      description TEXT,
      is_featured INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS destination_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      destination_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      estimated_cost REAL DEFAULT 0,
      FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trip_stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      city_name TEXT NOT NULL,
      country TEXT NOT NULL,
      arrival_date DATE NOT NULL,
      departure_date DATE NOT NULL,
      stay_days INTEGER DEFAULT 1,
      stop_order INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trip_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      stop_id INTEGER,
      day_number INTEGER DEFAULT 1,
      title TEXT NOT NULL,
      location TEXT,
      time_slot TEXT,
      duration TEXT,
      cost REAL DEFAULT 0,
      category TEXT DEFAULT 'Sightseeing',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_name TEXT NOT NULL,
      country TEXT NOT NULL,
      region TEXT NOT NULL,
      cost_index TEXT NOT NULL,
      description TEXT,
      image_url TEXT NOT NULL,
      popular_spots TEXT,
      is_featured INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      city_name TEXT NOT NULL,
      country TEXT NOT NULL,
      category TEXT NOT NULL,
      cost REAL DEFAULT 0,
      duration TEXT,
      description TEXT,
      image_url TEXT NOT NULL,
      rating REAL DEFAULT 4.8,
      is_featured INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS trip_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      day_number INTEGER DEFAULT 1,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS saved_wishlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      location TEXT NOT NULL,
      image_url TEXT NOT NULL,
      item_type TEXT DEFAULT 'destination',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token_hash);
    CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
    CREATE INDEX IF NOT EXISTS idx_trip_stops_trip ON trip_stops(trip_id);
    CREATE INDEX IF NOT EXISTS idx_trip_activities_trip ON trip_activities(trip_id);
    CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region);
    CREATE INDEX IF NOT EXISTS idx_activities_cat ON activities(category);
    CREATE INDEX IF NOT EXISTS idx_trip_expenses_trip ON trip_expenses(trip_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_user ON saved_wishlist(user_id);
  `);

  // Column migrations for users table
  try {
    const userColumns = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
    if (!userColumns.includes('currency')) db.exec("ALTER TABLE users ADD COLUMN currency TEXT DEFAULT 'USD'");
    if (!userColumns.includes('language')) db.exec("ALTER TABLE users ADD COLUMN language TEXT DEFAULT 'en'");
  } catch (err) {
    console.error('Users migration notice:', err.message);
  }

  // Seed default activity catalog if empty
  const actCount = db.prepare('SELECT COUNT(*) as count FROM activities').get().count;
  if (actCount === 0) {
    const insertActCatalog = db.prepare(`
      INSERT INTO activities (title, city_name, country, category, cost, duration, description, image_url, rating, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const activitySeeds = [
      {
        title: 'Fushimi Inari Shrine Sunset Trek',
        city_name: 'Kyoto',
        country: 'Japan',
        category: 'Culture',
        cost: 35,
        duration: '3 hours',
        description: 'Hike through thousands of vermilion torii gates stretching up Mount Inari in ancient Kyoto.',
        image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Tsukiji Outer Market Sushi Tasting',
        city_name: 'Tokyo',
        country: 'Japan',
        category: 'Food',
        cost: 65,
        duration: '2 hours',
        description: 'Sample fresh sashimi, tamagoyaki, and street seafood delicacies with an expert local foodie guide.',
        image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80',
        rating: 4.88
      },
      {
        title: 'Catamaran Sunset Sailing & Caldera Swim',
        city_name: 'Santorini',
        country: 'Greece',
        category: 'Adventure',
        cost: 160,
        duration: '5 hours',
        description: 'Sail around the volcanic caldera, swim in thermal hot springs, and enjoy a Greek BBQ dinner on board.',
        image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
        rating: 4.95
      },
      {
        title: 'Louvre Museum Priority Masterpiece Tour',
        city_name: 'Paris',
        country: 'France',
        category: 'Culture',
        cost: 75,
        duration: '2.5 hours',
        description: 'Skip the line to marvel at the Mona Lisa, Venus de Milo, and Winged Victory with an art historian.',
        image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
        rating: 4.92
      },
      {
        title: 'Gondola Serenade Along Grand Canal',
        city_name: 'Venice',
        country: 'Italy',
        category: 'Sightseeing',
        cost: 95,
        duration: '1 hour',
        description: 'Glide through narrow Venetian canals and under historic stone bridges accompanied by traditional Italian music.',
        image_url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
        rating: 4.85
      },
      {
        title: 'Giza Pyramids & Sphinx Private Camel Safari',
        city_name: 'Cairo',
        country: 'Egypt',
        category: 'Culture',
        cost: 50,
        duration: '4 hours',
        description: 'Experience panoramic desert views of the Great Pyramids on camelback with an Egyptologist guide.',
        image_url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
        rating: 4.87
      },
      {
        title: 'Christ the Redeemer & Sugarloaf Mountain Express',
        city_name: 'Rio de Janeiro',
        country: 'Brazil',
        category: 'Sightseeing',
        cost: 85,
        duration: '4.5 hours',
        description: 'Ascend Corcovado Mountain by cog train and ride the panoramic cable car up Sugarloaf Mountain.',
        image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
        rating: 4.9
      },
      {
        title: 'Broadway Musical Ticket & Backstage Pass',
        city_name: 'New York City',
        country: 'USA',
        category: 'Culture',
        cost: 180,
        duration: '3 hours',
        description: 'Immerse yourself in world-class theatrical performances in Manhattan’s iconic Theater District.',
        image_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=800&q=80',
        rating: 4.94
      },
      {
        title: 'High-Speed Shinkansen Bullet Train Ticket',
        city_name: 'Tokyo',
        country: 'Japan',
        category: 'Transport',
        cost: 120,
        duration: '2.5 hours',
        description: 'Smooth, futuristic rail travel connecting Tokyo to Kyoto at speeds exceeding 300 km/h.',
        image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
        rating: 4.96
      },
      {
        title: 'Positano Cliffside Lemon Grove & Limoncello Tasting',
        city_name: 'Amalfi Coast',
        country: 'Italy',
        category: 'Food',
        cost: 55,
        duration: '2 hours',
        description: 'Walk through family-owned terraced lemon orchards overlooking the Tyrrhenian Sea and taste artisan limoncello.',
        image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=800&q=80',
        rating: 4.91
      }
    ];

    for (const a of activitySeeds) {
      insertActCatalog.run(a.title, a.city_name, a.country, a.category, a.cost, a.duration, a.description, a.image_url, a.rating);
    }
  }

  // Seed default cities if empty
  const cityCount = db.prepare('SELECT COUNT(*) as count FROM cities').get().count;
  if (cityCount === 0) {
    const insertCity = db.prepare(`
      INSERT INTO cities (city_name, country, region, cost_index, description, image_url, popular_spots, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const citySeeds = [
      {
        city_name: 'Kyoto',
        country: 'Japan',
        region: 'Asia',
        cost_index: '$$$',
        description: 'Historic city renowned for classical Buddhist temples, gardens, imperial palaces, and geisha traditions.',
        image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        popular_spots: 'Fushimi Inari Shrine, Arashiyama Bamboo Grove, Kinkaku-ji, Gion'
      },
      {
        city_name: 'Santorini',
        country: 'Greece',
        region: 'Europe',
        cost_index: '$$$$',
        description: 'Cycladic island famed for white houses carved into cliffs above azure caldera waters.',
        image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
        popular_spots: 'Oia Sunset Point, Red Beach, Akrotiri Ruins, Fira Cliff Walk'
      },
      {
        city_name: 'Paris',
        country: 'France',
        region: 'Europe',
        cost_index: '$$$$',
        description: 'Global center for art, fashion, gastronomy, and culture with iconic monuments and romantic boulevards.',
        image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        popular_spots: 'Eiffel Tower, Louvre Museum, Notre-Dame, Montmartre'
      },
      {
        city_name: 'Tokyo',
        country: 'Japan',
        region: 'Asia',
        cost_index: '$$$',
        description: 'Ultramodern metropolis blending glowing skyscrapers, anime culture, tech, and historic Shinto shrines.',
        image_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
        popular_spots: 'Shibuya Crossing, Senso-ji Temple, Tokyo Tower, Akihabara'
      },
      {
        city_name: 'Venice',
        country: 'Italy',
        region: 'Europe',
        cost_index: '$$$',
        description: 'Unique floating city built on 100+ small islands connected by canals and historic bridges.',
        image_url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
        popular_spots: 'St. Mark Square, Grand Canal Gondola, Rialto Bridge, Doge Palace'
      },
      {
        city_name: 'Cairo',
        country: 'Egypt',
        region: 'Africa',
        cost_index: '$$',
        description: 'Sprawling capital along the Nile River housing ancient pharaonic monuments and bustling bazaars.',
        image_url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=800&q=80',
        popular_spots: 'Pyramids of Giza, Sphinx, Grand Egyptian Museum, Khan el-Khalili'
      },
      {
        city_name: 'Rio de Janeiro',
        country: 'Brazil',
        region: 'Americas',
        cost_index: '$$',
        description: 'Vibrant coastal city famed for Copacabana beach, samba music, and Christ the Redeemer statue.',
        image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
        popular_spots: 'Christ the Redeemer, Sugarloaf Mountain, Copacabana, Ipanema'
      },
      {
        city_name: 'New York City',
        country: 'USA',
        region: 'Americas',
        cost_index: '$$$$',
        description: 'Iconic global cultural hub featuring Broadway theaters, Central Park, and world-class museums.',
        image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
        popular_spots: 'Times Square, Central Park, Empire State Building, Statue of Liberty'
      }
    ];

    for (const c of citySeeds) {
      insertCity.run(c.city_name, c.country, c.region, c.cost_index, c.description, c.image_url, c.popular_spots);
    }
  }

  // Column migrations for trips table
  try {
    const columns = db.prepare("PRAGMA table_info(trips)").all().map(c => c.name);
    if (!columns.includes('trip_name')) db.exec("ALTER TABLE trips ADD COLUMN trip_name TEXT");
    if (!columns.includes('description')) db.exec("ALTER TABLE trips ADD COLUMN description TEXT");
    if (!columns.includes('cover_photo_url')) db.exec("ALTER TABLE trips ADD COLUMN cover_photo_url TEXT");
    if (!columns.includes('stop_count')) db.exec("ALTER TABLE trips ADD COLUMN stop_count INTEGER DEFAULT 1");
    if (!columns.includes('is_public')) db.exec("ALTER TABLE trips ADD COLUMN is_public INTEGER DEFAULT 1");
    if (!columns.includes('share_code')) db.exec("ALTER TABLE trips ADD COLUMN share_code TEXT");

    db.exec("CREATE INDEX IF NOT EXISTS idx_trips_share_code ON trips(share_code);");
  } catch (err) {
    console.error('Migration notice:', err.message);
  }

  // Seed default destinations if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM destinations').get().count;
  if (count === 0) {
    const insertDest = db.prepare(`
      INSERT INTO destinations (title, location, region, category, vibe, price, rating, image_url, description, is_featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);
    const insertAct = db.prepare(`
      INSERT INTO destination_activities (destination_id, title, category, estimated_cost)
      VALUES (?, ?, ?, ?)
    `);

    const seeds = [
      {
        title: 'Kyoto Cultural Sanctuary',
        location: 'Kyoto, Japan',
        region: 'Asia',
        category: 'Culture',
        vibe: 'Culture',
        price: 1450,
        rating: 4.9,
        image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        description: 'Immerse yourself in ancient temples, bamboo groves, and tea houses.',
        activities: [
          { title: 'Fushimi Inari Shrine & Gion Geisha Walk', category: 'Culture', cost: 40 },
          { title: 'Arashiyama Bamboo Grove & Tenryu-ji', category: 'Nature', cost: 25 },
          { title: 'Golden Pavilion & Traditional Tea Ceremony', category: 'Culture', cost: 50 }
        ]
      },
      {
        title: 'Santorini Cliffside Luxury',
        location: 'Santorini, Greece',
        region: 'Europe',
        category: 'Popular',
        vibe: 'Luxury',
        price: 2100,
        rating: 4.95,
        image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=800&q=80',
        description: 'Iconic whitewashed villas overlooking blue caldera waters and volcanic beaches.',
        activities: [
          { title: 'Cliffside Sunset Dinner in Oia', category: 'Dining', cost: 120 },
          { title: 'Catamaran Cruise around Red & White Beaches', category: 'Tour', cost: 180 },
          { title: 'Volcanic Vineyard Wine Tasting', category: 'Dining', cost: 95 }
        ]
      },
      {
        title: 'Banff Alpine Explorer',
        location: 'Banff National Park, Canada',
        region: 'Americas',
        category: 'Alpine',
        vibe: 'Alpine',
        price: 1200,
        rating: 4.88,
        image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        description: 'Turquoise glacial lakes, snow-capped Canadian Rockies, and wilderness hiking.',
        activities: [
          { title: 'Sunrise Canoe Excursion at Lake Louise', category: 'Nature', cost: 85 },
          { title: 'Glacier Skywalk & Icefield Parkway Drive', category: 'Tour', cost: 110 },
          { title: 'Banff Upper Hot Springs & Gondola Ride', category: 'Wellness', cost: 65 }
        ]
      },
      {
        title: 'Bali Island Paradise',
        location: 'Ubud & Seminyak, Indonesia',
        region: 'Asia',
        category: 'Tropical',
        vibe: 'Tropical',
        price: 950,
        rating: 4.85,
        image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
        description: 'Lush rice terraces, spiritual retreats, and vibrant beach clubs.',
        activities: [
          { title: 'Tegallalang Rice Terraces & Monkey Sanctuary', category: 'Nature', cost: 30 },
          { title: 'Sunrise Trek to Mount Batur Volcano', category: 'Adventure', cost: 75 },
          { title: 'Seminyak Sunset Beach Club & Spa Session', category: 'Wellness', cost: 90 }
        ]
      }
    ];

    for (const item of seeds) {
      const info = insertDest.run(
        item.title,
        item.location,
        item.region,
        item.category,
        item.vibe,
        item.price,
        item.rating,
        item.image_url,
        item.description
      );
      const destId = info.lastInsertRowid;
      for (const act of item.activities) {
        insertAct.run(destId, act.title, act.category, act.cost);
      }
    }
  }

  console.log('✅ SQLite Database schema & seeds initialized successfully at:', dbPath);
}

export default db;
