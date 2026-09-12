"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
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
    const passwordHash = await bcryptjs_1.default.hash('password123', 10);
    const demoUser = await prisma.user.create({
        data: {
            name: 'Alex Rover',
            email: 'alex@globetrotter.com',
            password_hash: passwordHash,
            role: 'USER',
            photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
            language_pref: 'en',
        },
    });
    const adminUser = await prisma.user.create({
        data: {
            name: 'Admin Explorer',
            email: 'admin@globetrotter.com',
            password_hash: passwordHash,
            role: 'ADMIN',
            photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
            language_pref: 'en',
        },
    });
    console.log('Created Users:', demoUser.email, adminUser.email);
    // Cities Dataset (16 Destinations)
    const citiesData = [
        {
            name: 'Paris',
            country: 'France',
            region: 'Europe',
            cost_index: 4.5,
            popularity_score: 98,
            image_url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
            description: 'The City of Light, world-renowned for art, fashion, gastronomy, and iconic architecture.',
            activities: [
                { name: 'Eiffel Tower Sunset Experience', category: 'Sightseeing', cost: 35, duration_minutes: 150, description: 'Summit access with panoramic views of Paris.', image_url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=600&q=80' },
                { name: 'Louvre Museum Guided Tour', category: 'Culture', cost: 50, duration_minutes: 180, description: 'Explore Mona Lisa and classic masterworks with expert commentary.', image_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80' },
                { name: 'Seine River Evening Dinner Cruise', category: 'Food', cost: 95, duration_minutes: 150, description: '3-course gourmet dining while gliding past illuminated monuments.', image_url: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=600&q=80' },
                { name: 'Montmartre & Sacré-Cœur Walking Tour', category: 'Culture', cost: 25, duration_minutes: 120, description: 'Stroll bohemian cobblestone streets and artist cafes.', image_url: 'https://images.unsplash.com/photo-1549144511-f099e773c147?w=600&q=80' },
                { name: 'French Croissant & Pastry Workshop', category: 'Food', cost: 70, duration_minutes: 120, description: 'Learn secrets of authentic French baking from a local chef.', image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80' },
            ],
        },
        {
            name: 'Tokyo',
            country: 'Japan',
            region: 'Asia',
            cost_index: 4.2,
            popularity_score: 97,
            image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
            description: 'An ultra-modern metropolis seamlessly blending futuristic neon districts and ancient temples.',
            activities: [
                { name: 'Shibuya Crossing & Harajuku Street Tour', category: 'Sightseeing', cost: 20, duration_minutes: 120, description: 'Experience the world busiest intersection and pop culture hub.', image_url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&q=80' },
                { name: 'Tsukiji Outer Market Food Crawl', category: 'Food', cost: 65, duration_minutes: 150, description: 'Sample fresh sushi, wagyu skewers, and tamagoyaki.', image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&q=80' },
                { name: 'teamLab Planets Digital Art Museum', category: 'Culture', cost: 38, duration_minutes: 120, description: 'Immersive body-on interactive light installation artwork.', image_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80' },
                { name: 'Senso-ji Temple & Asakusa Heritage Tour', category: 'Culture', cost: 15, duration_minutes: 90, description: 'Visit Tokyos oldest Buddhist temple and traditional shops.', image_url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&q=80' },
                { name: 'Mount Fuji & Hakone Day Trip', category: 'Adventure', cost: 110, duration_minutes: 480, description: 'Scenic bullet train journey, lake cruise, and Fuji vistas.', image_url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=600&q=80' },
            ],
        },
        {
            name: 'Rome',
            country: 'Italy',
            region: 'Europe',
            cost_index: 3.8,
            popularity_score: 95,
            image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80',
            description: 'The Eternal City packed with millennia of Roman history, ruins, and legendary culinary delights.',
            activities: [
                { name: 'Colosseum & Roman Forum VIP Access', category: 'Culture', cost: 48, duration_minutes: 180, description: 'Step onto gladiatorial arena floor with fast-track entry.', image_url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&q=80' },
                { name: 'Vatican Museums & Sistine Chapel', category: 'Culture', cost: 55, duration_minutes: 210, description: 'Marvel at Michelangelos ceiling and Papal art galleries.', image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&q=80' },
                { name: 'Trastevere Evening Food & Wine Tasting', category: 'Food', cost: 80, duration_minutes: 180, description: 'Authentic pasta carbonara, wine, and gelato tasting tour.', image_url: 'https://images.unsplash.com/photo-1533777857889-4be7c70b31f8?w=600&q=80' },
                { name: 'Trevi Fountain & Spanish Steps Sunset Stroll', category: 'Sightseeing', cost: 0, duration_minutes: 90, description: 'Classic Roman night walks with historic stories.', image_url: 'https://images.unsplash.com/photo-1525874684015-5837e71692d0?w=600&q=80' },
                { name: 'Traditional Pasta & Tiramisu Making Class', category: 'Food', cost: 65, duration_minutes: 150, description: 'Handcrafted fresh pasta workshop with local chef.', image_url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?w=600&q=80' },
            ],
        },
        {
            name: 'New York City',
            country: 'United States',
            region: 'North America',
            cost_index: 4.8,
            popularity_score: 96,
            image_url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
            description: 'The Big Apple — endless skyscrapers, Broadway theater, world-class museums, and diverse energy.',
            activities: [
                { name: 'SUMMIT One Vanderbilt Observation Deck', category: 'Sightseeing', cost: 46, duration_minutes: 120, description: 'Mirror room visual art and glass elevator sky views.', image_url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&q=80' },
                { name: 'Central Park Bike & Hidden Gems Tour', category: 'Adventure', cost: 32, duration_minutes: 150, description: 'Cycle past Bethesda Terrace, Strawberry Fields, and lakes.', image_url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80' },
                { name: 'Broadway Show Evening Ticket', category: 'Culture', cost: 120, duration_minutes: 150, description: 'Top musical theatre performance in Times Square district.', image_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80' },
                { name: 'Statue of Liberty & Ellis Island Ferry', category: 'Sightseeing', cost: 25, duration_minutes: 240, description: 'Close-up look at Lady Liberty and immigration history.', image_url: 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=600&q=80' },
                { name: 'Brooklyn Bridge & DUMBO Walking Tour', category: 'Sightseeing', cost: 18, duration_minutes: 120, description: 'Iconic bridge skyline photography and local pizza spots.', image_url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&q=80' },
            ],
        },
        {
            name: 'Bali',
            country: 'Indonesia',
            region: 'Asia',
            cost_index: 2.2,
            popularity_score: 94,
            image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
            description: 'Tropical paradise of lush rice terraces, sacred temples, surf beaches, and spiritual wellness.',
            activities: [
                { name: 'Ubud Rice Terrace & Jungle Swing Excursion', category: 'Adventure', cost: 25, duration_minutes: 180, description: 'Tegalalang rice paddies, coffee plantations, and swings.', image_url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80' },
                { name: 'Uluwatu Sunset Temple & Kecak Fire Dance', category: 'Culture', cost: 18, duration_minutes: 150, description: 'Dramatic cliffside temple performance against ocean sunset.', image_url: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&q=80' },
                { name: 'Mount Batur Sunrise Volcano Trekking', category: 'Adventure', cost: 45, duration_minutes: 360, description: 'Early morning hike for breakfast atop an active volcano summit.', image_url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=600&q=80' },
                { name: 'Nusa Penida Island Day Tour by Fast Boat', category: 'Sightseeing', cost: 65, duration_minutes: 480, description: 'Visit Kelingking T-Rex Beach, Angel Billabong, and snorkeling.', image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80' },
                { name: 'Balinese Herbal Spa & Wellness Treatment', category: 'Relaxation', cost: 35, duration_minutes: 120, description: 'Traditional flower bath, body scrub, and holistic massage.', image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80' },
            ],
        },
        {
            name: 'Barcelona',
            country: 'Spain',
            region: 'Europe',
            cost_index: 3.5,
            popularity_score: 93,
            image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80',
            description: 'Catalan coastal capital famous for Antoni Gaudís surreal architecture, beach life, and tapas.',
            activities: [
                { name: 'Sagrada Família Fast-Track Guided Tour', category: 'Culture', cost: 36, duration_minutes: 120, description: 'Explore Gaudis masterwork basilica towers and stained glass.', image_url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&q=80' },
                { name: 'Park Güell & Gaudí Landmarks Tour', category: 'Culture', cost: 22, duration_minutes: 150, description: 'Mosaic serpentine benches and panoramic Barcelona views.', image_url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80' },
                { name: 'Gothic Quarter Tapas & Sangria Crawl', category: 'Food', cost: 55, duration_minutes: 180, description: 'Sample Iberian ham, croquettes, patatas bravas, and wine.', image_url: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=600&q=80' },
                { name: 'Barceloneta Beach Sunset Catamaran Cruise', category: 'Relaxation', cost: 40, duration_minutes: 120, description: 'Sailing along Mediterranean coastline with live music.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
                { name: 'Flamenco Show at Tablao Cordobes', category: 'Culture', cost: 45, duration_minutes: 90, description: 'Passionate Andalusian music and dance performance.', image_url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&q=80' },
            ],
        },
        {
            name: 'Kyoto',
            country: 'Japan',
            region: 'Asia',
            cost_index: 3.9,
            popularity_score: 92,
            image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
            description: 'The cultural heart of Japan, featuring thousands of classical Buddhist temples, gardens, and geisha districts.',
            activities: [
                { name: 'Fushimi Inari Thousand Torii Gates Walk', category: 'Culture', cost: 0, duration_minutes: 150, description: 'Hike through sacred vermilion arch pathways up Mount Inari.', image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&q=80' },
                { name: 'Arashiyama Bamboo Grove & Monkey Park', category: 'Sightseeing', cost: 12, duration_minutes: 180, description: 'Towering green bamboo trails and panoramic hill views.', image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&q=80' },
                { name: 'Authentic Tea Ceremony Experience', category: 'Culture', cost: 35, duration_minutes: 75, description: 'Learn traditional matcha preparation in historic Machiya.', image_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80' },
                { name: 'Kinkaku-ji (Golden Pavilion) & Rock Gardens', category: 'Sightseeing', cost: 10, duration_minutes: 120, description: 'Zen gardens around gold-leaf layered pavilion reflected in pond.', image_url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80' },
                { name: 'Gion Nighttime Geisha District Tour', category: 'Culture', cost: 25, duration_minutes: 120, description: 'Lantern-lit traditional wooden street lantern walks.', image_url: 'https://images.unsplash.com/photo-1528164344705-47542687990d?w=600&q=80' },
            ],
        },
        {
            name: 'Sydney',
            country: 'Australia',
            region: 'Oceania',
            cost_index: 4.1,
            popularity_score: 91,
            image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
            description: 'Harbor city famous for the Sydney Opera House, Bondi surfing beaches, and outdoor coastal beauty.',
            activities: [
                { name: 'Sydney Opera House Behind-the-Scenes Tour', category: 'Culture', cost: 42, duration_minutes: 90, description: 'Architectural history and concert hall backstage access.', image_url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&q=80' },
                { name: 'Sydney Harbour BridgeClimb', category: 'Adventure', cost: 180, duration_minutes: 210, description: 'Scale the iconic steel arches for 360-degree harbor panoramas.', image_url: 'https://images.unsplash.com/photo-1528072164453-f4e8ef0d475a?w=600&q=80' },
                { name: 'Bondi to Coogee Coastal Walk', category: 'Adventure', cost: 0, duration_minutes: 150, description: 'Cliffside ocean vistas, beach stops, and rock pool swimming.', image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80' },
                { name: 'Blue Mountains Day Trip & Scenic World', category: 'Adventure', cost: 95, duration_minutes: 480, description: 'Three Sisters rock formations, cable car, and eucalyptus forests.', image_url: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=600&q=80' },
                { name: 'Manly Beach Ferry & Seafood Lunch', category: 'Food', cost: 40, duration_minutes: 180, description: 'Scenic harbor ferry ride to relaxed beachside seafood dining.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
            ],
        },
        {
            name: 'London',
            country: 'United Kingdom',
            region: 'Europe',
            cost_index: 4.6,
            popularity_score: 95,
            image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80',
            description: 'A global capital steeped in royal history, world-class museums, West End theater, and iconic landmarks.',
            activities: [
                { name: 'Tower of London & Crown Jewels', category: 'Culture', cost: 38, duration_minutes: 180, description: 'Royal fortress history, Beefeater tours, and priceless jewels.', image_url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&q=80' },
                { name: 'London Eye Flight Capsule', category: 'Sightseeing', cost: 35, duration_minutes: 60, description: '360 degree skyline view over Big Ben and Houses of Parliament.', image_url: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=600&q=80' },
                { name: 'British Museum Highlight Tour', category: 'Culture', cost: 25, duration_minutes: 150, description: 'Rosetta Stone, Egyptian mummies, and Parthenon sculptures.', image_url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=600&q=80' },
                { name: 'Borough Market Street Food Tour', category: 'Food', cost: 50, duration_minutes: 120, description: 'Artisanal cheeses, salt beef bagels, and British pies.', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' },
                { name: 'West End Musical Evening', category: 'Culture', cost: 90, duration_minutes: 150, description: 'Top theatrical show in Covent Garden entertainment district.', image_url: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=600&q=80' },
            ],
        },
        {
            name: 'Dubai',
            country: 'United Arab Emirates',
            region: 'Middle East',
            cost_index: 4.7,
            popularity_score: 93,
            image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
            description: 'Futuristic luxury hub boasting the worlds tallest tower, mega malls, desert safaris, and artificial islands.',
            activities: [
                { name: 'Burj Khalifa 148th Floor Observation Access', category: 'Sightseeing', cost: 90, duration_minutes: 120, description: 'Highest outdoor observatory deck in the world.', image_url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
                { name: 'Desert Safari with Dune Bashing & BBQ', category: 'Adventure', cost: 65, duration_minutes: 360, description: '4x4 dunes, camel rides, belly dancing, and stargazing dinner.', image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&q=80' },
                { name: 'Dubai Marina Yacht Sunset Cruise', category: 'Relaxation', cost: 75, duration_minutes: 150, description: 'Luxury yachting past Ain Dubai and Palm Jumeirah.', image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80' },
                { name: 'Museum of the Future Interactive Experience', category: 'Culture', cost: 40, duration_minutes: 150, description: 'Cutting edge AI, space, and eco-innovation exhibits.', image_url: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?w=600&q=80' },
                { name: 'Old Dubai Souks & Abra Boat Ride', category: 'Culture', cost: 15, duration_minutes: 120, description: 'Gold & Spice Souk walks and traditional wooden boat crossing.', image_url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=600&q=80' },
            ],
        },
        {
            name: 'Cape Town',
            country: 'South Africa',
            region: 'Africa',
            cost_index: 2.8,
            popularity_score: 90,
            image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800&q=80',
            description: 'Breathtaking coastal beauty dominated by Table Mountain, vineyards, wildlife, and vibrant heritage.',
            activities: [
                { name: 'Table Mountain Cableway Ride & Summit Walk', category: 'Adventure', cost: 25, duration_minutes: 150, description: '360 revolving cable car ride to flat mountain top vistas.', image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80' },
                { name: 'Cape Peninsula & Boulders Beach Penguins', category: 'Adventure', cost: 60, duration_minutes: 420, description: 'Cape of Good Hope nature reserve and African penguin colony.', image_url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=80' },
                { name: 'Franschhoek Winelands Wine Tram Tour', category: 'Food', cost: 75, duration_minutes: 360, description: 'Hop-on hop-off vintage tram between estate wine tastings.', image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80' },
                { name: 'Robben Island Ferry & Historical Tour', category: 'Culture', cost: 30, duration_minutes: 240, description: 'Nelson Mandelas former prison guided by ex-political prisoners.', image_url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80' },
                { name: 'V&A Waterfront Sunset Catamaran', category: 'Relaxation', cost: 35, duration_minutes: 120, description: 'Champagne sailing trip with Table Mountain backdrop.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
            ],
        },
        {
            name: 'Amsterdam',
            country: 'Netherlands',
            region: 'Europe',
            cost_index: 4.0,
            popularity_score: 93,
            image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=800&q=80',
            description: 'Picturesque canal ring, historic narrow gable houses, world-leading art museums, and cycling culture.',
            activities: [
                { name: 'Van Gogh Museum Skip-the-Line Ticket', category: 'Culture', cost: 24, duration_minutes: 120, description: 'Largest collection of Vincent van Goghs paintings globally.', image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&q=80' },
                { name: 'Classic Canal Cruise with Dutch Cheese & Wine', category: 'Sightseeing', cost: 32, duration_minutes: 90, description: 'Glass-topped boat cruising through UNESCO canal ring.', image_url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=600&q=80' },
                { name: 'Anne Frank House & Jewish Quarter Walking Tour', category: 'Culture', cost: 28, duration_minutes: 150, description: 'Moving historical walk through WWII resistance places.', image_url: 'https://images.unsplash.com/photo-1584003564911-a7a321c84e1c?w=600&q=80' },
                { name: 'Zaanse Schans Windmills & Cheese Farm Day Trip', category: 'Culture', cost: 45, duration_minutes: 240, description: 'Traditional Dutch windmills, clog making, and gouda tasting.', image_url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=600&q=80' },
                { name: 'Guided Bike Tour of Jordaan & Vondelpark', category: 'Adventure', cost: 26, duration_minutes: 150, description: 'Ride like a local through charming canal streets.', image_url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600&q=80' },
            ],
        },
        {
            name: 'Rio de Janeiro',
            country: 'Brazil',
            region: 'South America',
            cost_index: 2.9,
            popularity_score: 89,
            image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80',
            description: 'Marvelous City surrounded by dramatic granite peaks, samba rhythms, and world-famous Copacabana beaches.',
            activities: [
                { name: 'Christ the Redeemer & Corcovado Train', category: 'Sightseeing', cost: 30, duration_minutes: 150, description: 'Ascend Corcovado mountain to one of New 7 Wonders of the World.', image_url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=600&q=80' },
                { name: 'Sugarloaf Mountain Cable Car Sunset', category: 'Sightseeing', cost: 35, duration_minutes: 120, description: 'Glass cable cars linking Urca and Sugarloaf peaks over Guanabara Bay.', image_url: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=600&q=80' },
                { name: 'Copacabana & Ipanema Beach Experience', category: 'Relaxation', cost: 0, duration_minutes: 180, description: 'Sip fresh caipirinhas and enjoy Brazilian beach culture.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
                { name: 'Santa Teresa & Selarón Steps Tour', category: 'Culture', cost: 20, duration_minutes: 150, description: 'Bright ceramic tile staircase and bohemian artist quarter.', image_url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&q=80' },
                { name: 'Tijuca National Park Forest Jeep Tour', category: 'Adventure', cost: 50, duration_minutes: 240, description: 'Explore one of the worlds largest urban tropical rainforests.', image_url: 'https://images.unsplash.com/photo-1511497584788-876761c119ee?w=600&q=80' },
            ],
        },
        {
            name: 'Bangkok',
            country: 'Thailand',
            region: 'Asia',
            cost_index: 2.1,
            popularity_score: 95,
            image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=800&q=80',
            description: 'Vibrant street life, ornate golden shrines, bustling canal markets, and unmatched culinary scene.',
            activities: [
                { name: 'Grand Palace & Emerald Buddha Guided Tour', category: 'Culture', cost: 18, duration_minutes: 180, description: 'Royal sacred complex featuring shimmering gold stupas.', image_url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=600&q=80' },
                { name: 'Wat Arun (Temple of Dawn) Boat Visit', category: 'Culture', cost: 5, duration_minutes: 90, description: 'Iconic riverfront porcelain spire temple.', image_url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=600&q=80' },
                { name: 'Chinatown Yaowarat Midnight Street Food Crawl', category: 'Food', cost: 25, duration_minutes: 150, description: 'Tuk-tuk ride tasting Michelin-recommended street noodles.', image_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80' },
                { name: 'Damnoen Saduak Floating Market Tour', category: 'Culture', cost: 35, duration_minutes: 300, description: 'Paddle boat shopping through lively canal market vendors.', image_url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&q=80' },
                { name: 'Traditional Thai Massage at Wat Pho', category: 'Relaxation', cost: 20, duration_minutes: 90, description: 'Authentic therapeutic massage at Thailands premiere school.', image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80' },
            ],
        },
        {
            name: 'Reykjavik',
            country: 'Iceland',
            region: 'Europe',
            cost_index: 4.9,
            popularity_score: 88,
            image_url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800&q=80',
            description: 'Gateway to geothermal wonders, Northern Lights, roaring waterfalls, volcanic craters, and glaciers.',
            activities: [
                { name: 'Blue Lagoon Geothermal Spa Experience', category: 'Relaxation', cost: 85, duration_minutes: 240, description: 'Bathe in mineral-rich milky blue waters with silica mud masks.', image_url: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&q=80' },
                { name: 'Golden Circle Tour (Gullfoss, Geysir & Thingvellir)', category: 'Adventure', cost: 70, duration_minutes: 480, description: 'Erupting geysers, tectonic rift valley, and massive waterfall.', image_url: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=600&q=80' },
                { name: 'Northern Lights (Aurora Borealis) Bus Hunt', category: 'Adventure', cost: 65, duration_minutes: 240, description: 'Guided night search for dancing green lights in dark sky.', image_url: 'https://images.unsplash.com/photo-1531366936337-7c91f332308b?w=600&q=80' },
                { name: 'Glacier Hike on Solheimajokull', category: 'Adventure', cost: 110, duration_minutes: 360, description: 'Crampons and ice axe guided adventure on ancient ice sheet.', image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80' },
                { name: 'Reykjavik Whale Watching Cruise', category: 'Adventure', cost: 80, duration_minutes: 210, description: 'Spot humpback whales and puffins in Faxafloi Bay.', image_url: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=600&q=80' },
            ],
        },
        {
            name: 'Santorini',
            country: 'Greece',
            region: 'Europe',
            cost_index: 4.4,
            popularity_score: 94,
            image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
            description: 'Iconic Cycladic island with whitewashed cliffside villages, blue-domed churches, and volcanic caldera sunsets.',
            activities: [
                { name: 'Oia Village Sunset Photography Tour', category: 'Sightseeing', cost: 30, duration_minutes: 120, description: 'Golden hour walk through cliffside alleys and blue domes.', image_url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80' },
                { name: 'Caldera Luxury Catamaran Sailing with BBQ', category: 'Relaxation', cost: 120, duration_minutes: 300, description: 'Sailing past Red Beach, White Beach, and hot springs bath.', image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80' },
                { name: 'Santorini Volcanic Wine Tasting Tour', category: 'Food', cost: 75, duration_minutes: 210, description: 'Taste crisp Assyrtiko wines at 3 cliffside wineries.', image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80' },
                { name: 'Akrotiri Prehistoric Bronze Age Ruins', category: 'Culture', cost: 15, duration_minutes: 90, description: 'Minoan Pompeii preserved beneath volcanic ash.', image_url: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=600&q=80' },
                { name: 'Fira to Oia Cliffside Hike', category: 'Adventure', cost: 0, duration_minutes: 180, description: 'Scenic 10km caldera rim walking trail with endless sea views.', image_url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600&q=80' },
            ],
        },
    ];
    for (const cData of citiesData) {
        const { activities, ...cityData } = cData;
        const city = await prisma.city.create({
            data: cityData,
        });
        for (const act of activities) {
            await prisma.activity.create({
                data: {
                    ...act,
                    city_id: city.id,
                },
            });
        }
    }
    console.log('Seeded 16 Cities and ~80 Activities successfully!');
    // Seed Demo Trips for Alex Rover
    const paris = await prisma.city.findFirst({ where: { name: 'Paris' } });
    const rome = await prisma.city.findFirst({ where: { name: 'Rome' } });
    const barcelona = await prisma.city.findFirst({ where: { name: 'Barcelona' } });
    if (paris && rome && barcelona) {
        const grandEuroTrip = await prisma.trip.create({
            data: {
                user_id: demoUser.id,
                name: 'Grand European Adventure 2026',
                start_date: new Date('2026-09-10'),
                end_date: new Date('2026-09-24'),
                description: 'A 2-week journey across Western Europes most iconic historical capitals and coastal cities.',
                cover_photo_url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1000&q=80',
                is_public: true,
            },
        });
        // Stop 1: Paris
        const stop1 = await prisma.stop.create({
            data: {
                trip_id: grandEuroTrip.id,
                city_id: paris.id,
                order_index: 0,
                arrival_date: new Date('2026-09-10'),
                departure_date: new Date('2026-09-15'),
            },
        });
        // Stop 2: Rome
        const stop2 = await prisma.stop.create({
            data: {
                trip_id: grandEuroTrip.id,
                city_id: rome.id,
                order_index: 1,
                arrival_date: new Date('2026-09-15'),
                departure_date: new Date('2026-09-19'),
            },
        });
        // Stop 3: Barcelona
        const stop3 = await prisma.stop.create({
            data: {
                trip_id: grandEuroTrip.id,
                city_id: barcelona.id,
                order_index: 2,
                arrival_date: new Date('2026-09-19'),
                departure_date: new Date('2026-09-24'),
            },
        });
        // Add Activities to Paris Stop
        const parisActs = await prisma.activity.findMany({ where: { city_id: paris.id } });
        if (parisActs.length >= 3) {
            await prisma.stopActivity.create({
                data: {
                    stop_id: stop1.id,
                    activity_id: parisActs[0].id,
                    scheduled_date: new Date('2026-09-11'),
                    scheduled_time: '18:30',
                },
            });
            await prisma.stopActivity.create({
                data: {
                    stop_id: stop1.id,
                    activity_id: parisActs[1].id,
                    scheduled_date: new Date('2026-09-12'),
                    scheduled_time: '10:00',
                },
            });
        }
        // Add Activities to Rome Stop
        const romeActs = await prisma.activity.findMany({ where: { city_id: rome.id } });
        if (romeActs.length >= 2) {
            await prisma.stopActivity.create({
                data: {
                    stop_id: stop2.id,
                    activity_id: romeActs[0].id,
                    scheduled_date: new Date('2026-09-16'),
                    scheduled_time: '09:00',
                },
            });
            await prisma.stopActivity.create({
                data: {
                    stop_id: stop2.id,
                    activity_id: romeActs[2].id,
                    scheduled_date: new Date('2026-09-17'),
                    scheduled_time: '19:00',
                },
            });
        }
        // Add Budget Items
        await prisma.budgetItem.createMany({
            data: [
                { trip_id: grandEuroTrip.id, category: 'Transport', name: 'Flight: NYC to Paris', estimated_cost: 650, actual_cost: 620 },
                { trip_id: grandEuroTrip.id, category: 'Transport', name: 'Eurostar & Trains', estimated_cost: 220, actual_cost: 210 },
                { trip_id: grandEuroTrip.id, category: 'Stay', name: 'Boutique Hotel Paris (5 nights)', estimated_cost: 850, actual_cost: 850 },
                { trip_id: grandEuroTrip.id, category: 'Stay', name: 'Rome Historic Airbnb (4 nights)', estimated_cost: 520, actual_cost: 500 },
                { trip_id: grandEuroTrip.id, category: 'Stay', name: 'Barcelona Beach Hotel (5 nights)', estimated_cost: 700, actual_cost: 680 },
                { trip_id: grandEuroTrip.id, category: 'Food', name: 'Dining & Cafes Allowance', estimated_cost: 800, actual_cost: 750 },
            ],
        });
        console.log('Seeded Grand Euro Trip demo data successfully!');
    }
    // Seed Tokyo Explorer Trip
    const tokyo = await prisma.city.findFirst({ where: { name: 'Tokyo' } });
    const kyoto = await prisma.city.findFirst({ where: { name: 'Kyoto' } });
    if (tokyo && kyoto) {
        const japanTrip = await prisma.trip.create({
            data: {
                user_id: demoUser.id,
                name: 'Japan Neon & Heritage 2026',
                start_date: new Date('2026-11-01'),
                end_date: new Date('2026-11-10'),
                description: 'Exploring Tokyos high-tech energy and Kyotos peaceful Zen sanctuaries.',
                cover_photo_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1000&q=80',
                is_public: false,
            },
        });
        await prisma.stop.create({
            data: {
                trip_id: japanTrip.id,
                city_id: tokyo.id,
                order_index: 0,
                arrival_date: new Date('2026-11-01'),
                departure_date: new Date('2026-11-06'),
            },
        });
        await prisma.stop.create({
            data: {
                trip_id: japanTrip.id,
                city_id: kyoto.id,
                order_index: 1,
                arrival_date: new Date('2026-11-06'),
                departure_date: new Date('2026-11-10'),
            },
        });
        console.log('Seeded Japan Trip demo data successfully!');
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
