import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, SlidersHorizontal, ArrowUpDown, Layers, Heart, MessageSquare, 
  Share2, Bookmark, UserPlus, MapPin, Tag, Plus, CheckCircle2, 
  Sparkles, Send, X, Clock, DollarSign, ArrowRight, Eye, ChevronDown, 
  Calendar, Camera, ThumbsUp, Compass, Users
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { Trip } from '../types';
import { VideoEmbed } from '../components/VideoEmbed';

interface Comment {
  id: string;
  author: string;
  authorAvatar: string;
  text: string;
  timeAgo: string;
}

interface CommunityPost {
  id: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
    isVerified?: boolean;
    location: string;
  };
  tripTitle: string;
  destination: string;
  country: string;
  region: 'Europe' | 'Asia' | 'North America' | 'South America' | 'Oceania' | 'Middle East' | 'Africa';
  activityCategory: 'Sightseeing' | 'Food & Wine' | 'Adventure' | 'Culture & Temples' | 'Relaxation';
  timeAgo: string;
  timestamp: number;
  caption: string;
  tags: string[];
  photoUrl: string;
  videoUrl?: string;
  likesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  budgetNumeric: number;
  budgetDisplay: string;
  durationDays: number;
  durationDisplay: string;
  itinerarySummary: string[];
  comments: Comment[];
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: {
      name: 'Elena Rostova',
      handle: '@elena_wanderlust',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      isVerified: true,
      location: 'Santorini, Greece',
    },
    tripTitle: 'Cycladic Dream: 5 Days Across Santorini & Oia Cliffs',
    destination: 'Santorini',
    country: 'Greece 🇬🇷',
    region: 'Europe',
    activityCategory: 'Relaxation',
    timeAgo: '2 hours ago',
    timestamp: Date.now() - 2 * 3600 * 1000,
    caption: 'Just wrapped up the most magical 5 days exploring Santorini’s whitewashed alleys and caldera cliffs. The sunrise hike from Fira to Oia was peaceful and uncrowded. Paired fresh grilled octopus with crisp Assyrtiko wine in Ammoudi Bay! 🌊🍷',
    tags: ['#Santorini', '#GreeceTravel', '#SunsetLovers', '#IslandLife'],
    photoUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=80',
    likesCount: 248,
    isLiked: false,
    budgetNumeric: 1350,
    budgetDisplay: '$1,350 total',
    durationDays: 5,
    durationDisplay: '5 Days / 4 Nights',
    itinerarySummary: ['Day 1: Fira sunset caldera walk', 'Day 2: Luxury Caldera Catamaran cruise', 'Day 3: Oia Photography & Ammoudi Bay dinner', 'Day 4: Akrotiri ruins & Red Beach', 'Day 5: Santo Wines tasting'],
    comments: [
      {
        id: 'c1',
        author: 'Marcus Brody',
        authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
        text: 'That view is incredible! Did you book the catamaran cruise in advance?',
        timeAgo: '1 hour ago',
      },
    ],
  },
  {
    id: 'post-2',
    author: {
      name: 'Kenji Takahashi',
      handle: '@kenji_explores',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
      isVerified: true,
      location: 'Tokyo & Kyoto, Japan',
    },
    tripTitle: 'Tokyo to Kyoto: High-Speed Rail, Neon Alleys & Zen Shrines',
    destination: 'Tokyo',
    country: 'Japan 🇯🇵',
    region: 'Asia',
    activityCategory: 'Culture & Temples',
    timeAgo: '5 hours ago',
    timestamp: Date.now() - 5 * 3600 * 1000,
    caption: 'Pro tip for first timers in Tokyo: get the digital Suica card and ride the JR Yamanote line. teamLab Planets in Toyosu was breathtaking—walking barefoot through illuminated digital water. Followed by bullet train to peaceful Kyoto! 🍜🏯',
    tags: ['#TokyoTravel', '#Kyoto', '#JapanGuide', '#StreetFood'],
    photoUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&q=80',
    likesCount: 392,
    isLiked: true,
    budgetNumeric: 1800,
    budgetDisplay: '$1,800 total',
    durationDays: 7,
    durationDisplay: '7 Days',
    itinerarySummary: ['Day 1-3: Shibuya, Harajuku, teamLab Planets', 'Day 4: Shinkansen to Kyoto & Gion walk', 'Day 5-6: Fushimi Inari Torii Gates & Tea Ceremony', 'Day 7: Arashiyama Bamboo Grove'],
    comments: [
      {
        id: 'c2',
        author: 'Sarah Jenkins',
        authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
        text: 'The photo at Shibuya is iconic! How long did you spend in Kyoto?',
        timeAgo: '3 hours ago',
      },
    ],
  },
  {
    id: 'post-3',
    author: {
      name: 'Maya Sharma',
      handle: '@maya_travelfoodie',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&q=80',
      isVerified: false,
      location: 'Rome, Italy',
    },
    tripTitle: '72 Hours in Rome: Ancient Gladiators & Secret Pasta Class',
    destination: 'Rome',
    country: 'Italy 🇮🇹',
    region: 'Europe',
    activityCategory: 'Food & Wine',
    timeAgo: '1 day ago',
    timestamp: Date.now() - 24 * 3600 * 1000,
    caption: 'Woke up at 6:30 AM to catch Trevi Fountain completely empty! Stepping onto the Colosseum arena floor gives you goosebumps. Don’t skip Giolitti for pistachio gelato and fresh carbonara in Trastevere. 🏛️🍨',
    tags: ['#RomeItinerary', '#Colosseum', '#ItalianFood', '#SoloTravel'],
    photoUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80',
    likesCount: 174,
    isLiked: false,
    budgetNumeric: 820,
    budgetDisplay: '$820 total',
    durationDays: 3,
    durationDisplay: '3 Days',
    itinerarySummary: ['Day 1: Colosseum & Roman Forum VIP Access', 'Day 2: Vatican Museums & Sistine Chapel', 'Day 3: Trastevere Pasta Making & Catacombs'],
    comments: [],
  },
  {
    id: 'post-4',
    author: {
      name: 'Liam O\'Connor',
      handle: '@liam_adventure',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
      isVerified: true,
      location: 'Bali, Indonesia',
    },
    tripTitle: 'Bali Tropical Expedition: Mount Batur Sunrise & Surf Camps',
    destination: 'Bali',
    country: 'Indonesia 🇮🇩',
    region: 'Asia',
    activityCategory: 'Adventure',
    timeAgo: '2 days ago',
    timestamp: Date.now() - 48 * 3600 * 1000,
    caption: 'Hiking up Mount Batur at 4:00 AM in pitch black was worth every step once the golden sun broke through the volcano mist. Afterwards, chilled in the natural hot springs and visited the Ubud rice terraces! 🌋🏄‍♂️',
    tags: ['#BaliAdventure', '#VolcanoTrek', '#Surfing', '#Backpacking'],
    photoUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&q=80',
    likesCount: 310,
    isLiked: true,
    budgetNumeric: 650,
    budgetDisplay: '$650 total',
    durationDays: 6,
    durationDisplay: '6 Days',
    itinerarySummary: ['Day 1-2: Canggu surf & beach clubs', 'Day 3: Mount Batur sunrise trek', 'Day 4: Ubud rice terraces & jungle swings', 'Day 5-6: Uluwatu sunset temple & fire dance'],
    comments: [],
  },
  {
    id: 'post-5',
    author: {
      name: 'Sophia Martinez',
      handle: '@sophia_lifestyle',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
      isVerified: true,
      location: 'Paris, France',
    },
    tripTitle: 'Parisian Elegance: Eiffel Sunset, Louvre Tour & Pastry Chef Masterclass',
    destination: 'Paris',
    country: 'France 🇫🇷',
    region: 'Europe',
    activityCategory: 'Sightseeing',
    timeAgo: '3 days ago',
    timestamp: Date.now() - 72 * 3600 * 1000,
    caption: 'Sunset cruise along the Seine with illuminated monuments passing by is pure romance. Spent the morning learning authentic French croissant baking in Le Marais from a local pastry master chef! 🥐🗼',
    tags: ['#ParisGuide', '#EiffelTower', '#FrenchBaking', '#Romance'],
    photoUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&q=80',
    likesCount: 215,
    isLiked: false,
    budgetNumeric: 1100,
    budgetDisplay: '$1,100 total',
    durationDays: 4,
    durationDisplay: '4 Days',
    itinerarySummary: ['Day 1: Eiffel Tower Summit & Seine Dinner Cruise', 'Day 2: Louvre Museum Guided Tour', 'Day 3: Croissant & Pastry Workshop', 'Day 4: Montmartre bohemian artist walk'],
    comments: [],
  },
];

export const Community: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<'none' | 'region' | 'category' | 'destination'>('none');
  const [filterRegion, setFilterRegion] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'newest' | 'budget_low' | 'budget_high'>('popular');

  // Dropdowns state
  const [groupByOpen, setGroupByOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  // New Post Modal & Comments
  const [newPostModalOpen, setNewPostModalOpen] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const [searchParams] = useSearchParams();
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState('');

  useEffect(() => {
    api.get('/trips')
      .then((res) => {
        const tripsList = res.data.trips || [];
        setUserTrips(tripsList);

        const tripIdFromUrl = searchParams.get('share_trip_id');
        if (tripIdFromUrl) {
          const target = tripsList.find((t: Trip) => t.id === tripIdFromUrl);
          if (target) {
            setNewPostModalOpen(true);
            handleSelectTripToShare(target.id, tripsList);
          }
        }
      })
      .catch(console.error);
  }, [searchParams]);

  const handleSelectTripToShare = (tripId: string, trips = userTrips) => {
    setSelectedTripId(tripId);
    if (!tripId) return;

    const targetTrip = trips.find((t) => t.id === tripId);
    if (!targetTrip) return;

    const citiesList = targetTrip.stops?.map((s) => s.city.name).join(', ') || 'Global Destination';
    const firstCity = targetTrip.stops?.[0]?.city;

    let days = 3;
    if (targetTrip.start_date && targetTrip.end_date) {
      const start = new Date(targetTrip.start_date);
      const end = new Date(targetTrip.end_date);
      const diff = Math.abs(end.getTime() - start.getTime());
      days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    setNewTitle(targetTrip.name);
    setNewDestination(citiesList);
    if (firstCity?.region) {
      const reg = firstCity.region;
      if (['Europe', 'Asia', 'North America', 'South America', 'Middle East', 'Africa', 'Oceania'].includes(reg)) {
        setNewRegion(reg as any);
      }
    }
    setNewDays(days);
    setNewBudget(targetTrip.total_cost || 500);
    setNewPhoto(
      targetTrip.cover_photo_url ||
        firstCity?.image_url ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80'
    );
    setNewCaption(
      targetTrip.description ||
        `Just wrapped up an unforgettable ${days}-day trip exploring ${citiesList}! Here are my travel highlights and tips for fellow explorers...`
    );
  };

  // Form Fields
  const [newTitle, setNewTitle] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newCategory, setNewCategory] = useState<CommunityPost['activityCategory']>('Sightseeing');
  const [newRegion, setNewRegion] = useState<CommunityPost['region']>('Europe');
  const [newCaption, setNewCaption] = useState('');
  const [newBudget, setNewBudget] = useState(500);
  const [newDays, setNewDays] = useState(3);
  const [newPhoto, setNewPhoto] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');

  // Filter & Sort
  const filteredAndSortedPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const matchesSearch =
          post.tripTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesRegion =
          filterRegion === 'all' || post.region.toLowerCase() === filterRegion.toLowerCase();

        return matchesSearch && matchesRegion;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return b.likesCount - a.likesCount;
        if (sortBy === 'newest') return b.timestamp - a.timestamp;
        if (sortBy === 'budget_low') return a.budgetNumeric - b.budgetNumeric;
        if (sortBy === 'budget_high') return b.budgetNumeric - a.budgetNumeric;
        return 0;
      });
  }, [posts, searchQuery, filterRegion, sortBy]);

  // Grouping
  const groupedPosts = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Community Experiences': filteredAndSortedPosts };
    }

    return filteredAndSortedPosts.reduce((acc, post) => {
      let key = 'Other';
      if (groupBy === 'region') key = `📍 ${post.region}`;
      if (groupBy === 'category') key = `🏷️ ${post.activityCategory}`;
      if (groupBy === 'destination') key = `🏙️ ${post.destination} (${post.country})`;

      if (!acc[key]) acc[key] = [];
      acc[key].push(post);
      return acc;
    }, {} as Record<string, CommunityPost[]>);
  }, [filteredAndSortedPosts, groupBy]);

  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  const handleToggleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  };

  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      author: user?.name || 'Explorer Alex',
      authorAvatar: user?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      text: commentInput.trim(),
      timeAgo: 'Just now',
    };

    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p))
    );
    setCommentInput('');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDestination || !newCaption) return;

    const createdPost: CommunityPost = {
      id: `post-${Date.now()}`,
      author: {
        name: user?.name || 'Explorer Alex',
        handle: `@${(user?.name || 'alex').toLowerCase().replace(/\s+/g, '_')}`,
        avatar: user?.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
        isVerified: true,
        location: newDestination,
      },
      tripTitle: newTitle,
      destination: newDestination,
      country: 'World Voyage ✈️',
      region: newRegion,
      activityCategory: newCategory,
      timeAgo: 'Just now',
      timestamp: Date.now(),
      caption: newCaption,
      tags: [`#${newDestination.replace(/\s+/g, '')}`, `#${newCategory.replace(/\s+/g, '')}`, '#GlobeTrotter'],
      photoUrl: newPhoto || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
      videoUrl: newVideoUrl || undefined,
      likesCount: 1,
      isLiked: true,
      budgetNumeric: Number(newBudget),
      budgetDisplay: `$${Number(newBudget).toLocaleString()} total`,
      durationDays: Number(newDays),
      durationDisplay: `${newDays} Days`,
      itinerarySummary: ['Custom itinerary created via GlobeTrotter Community'],
      comments: [],
    };

    setPosts([createdPost, ...posts]);
    setNewPostModalOpen(false);
    setNewTitle('');
    setNewDestination('');
    setNewCaption('');
    setNewPhoto('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-16">
      
      {/* 1. TOP HEADER (Consistent with Dashboard / MyTrips / Cities tabs) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Travelers Network</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Community tab</h1>
          <p className="text-sm text-slate-500 mt-1">Discover, share and clone itineraries from fellow explorers worldwide</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setNewPostModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Share Experience</span>
          </button>
        </div>
      </div>

      {/* 2. SEARCH & CONTROLS TOOLBAR (Search bar, Group by, Filter, Sort by...) */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiences, destinations, activities or tags..."
            className="glass-input block w-full pl-11 pr-4 py-2.5 text-sm rounded-xl font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Buttons: Group by, Filter, Sort by */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          
          {/* Group by Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setGroupByOpen(!groupByOpen);
                setFilterOpen(false);
                setSortOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                groupBy !== 'none'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>Group by{groupBy !== 'none' ? `: ${groupBy}` : ''}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {groupByOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-fade-in space-y-1 text-xs">
                {[
                  { id: 'none', label: 'No Grouping' },
                  { id: 'region', label: 'Group by Region' },
                  { id: 'category', label: 'Group by Category' },
                  { id: 'destination', label: 'Group by City' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setGroupBy(opt.id as any);
                      setGroupByOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors font-semibold ${
                      groupBy === opt.id
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setFilterOpen(!filterOpen);
                setGroupByOpen(false);
                setSortOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                filterRegion !== 'all'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-600" />
              <span>Filter{filterRegion !== 'all' ? `: ${filterRegion}` : ''}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {filterOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-fade-in space-y-1 text-xs">
                <p className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filter Region</p>
                {['all', 'Europe', 'Asia', 'North America', 'South America', 'Middle East', 'Africa', 'Oceania'].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setFilterRegion(r);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl transition-colors font-semibold capitalize ${
                      filterRegion === r
                        ? 'bg-amber-500 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {r === 'all' ? 'All Global Regions' : r}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setSortOpen(!sortOpen);
                setGroupByOpen(false);
                setFilterOpen(false);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Sort by: {sortBy === 'popular' ? 'Popular' : sortBy === 'newest' ? 'Newest' : sortBy === 'budget_low' ? 'Budget $' : 'Budget $$$'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {sortOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 z-50 animate-fade-in space-y-1 text-xs">
                {[
                  { id: 'popular', label: '🔥 Most Popular (Likes)' },
                  { id: 'newest', label: '⏱️ Most Recent' },
                  { id: 'budget_low', label: '💰 Budget: Low to High' },
                  { id: 'budget_high', label: '💎 Budget: High to Low' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setSortBy(s.id as any);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors font-semibold ${
                      sortBy === s.id
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* 3. MAIN TIMELINE FEED POSTS (Matching Screen 10 wireframe: Avatar Node + Card) */}
      <div className="space-y-8">
        {Object.entries(groupedPosts).map(([groupTitle, groupPosts]) => (
          <div key={groupTitle} className="space-y-6">
            
            {/* Group Header */}
            {groupBy !== 'none' && (
              <div className="flex items-center gap-3 pt-2">
                <span className="text-sm font-black text-slate-800 uppercase tracking-wider">{groupTitle}</span>
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-xs text-slate-500 font-semibold">{groupPosts.length} trips</span>
              </div>
            )}

            {groupPosts.map((post) => (
              <div key={post.id} className="flex items-start gap-4 sm:gap-6 group">
                
                {/* Left Circular Avatar Node */}
                <div className="flex flex-col items-center shrink-0 pt-1">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-blue-500/80 p-0.5 bg-white shadow-md group-hover:scale-105 transition-all">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-full h-full rounded-full object-cover bg-slate-100"
                      />
                    </div>
                    {post.author.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center border-2 border-white shadow-sm">
                        <CheckCircle2 className="w-3 h-3 fill-white text-blue-600" />
                      </div>
                    )}
                  </div>
                  {/* Vertical timeline trail */}
                  <div className="w-0.5 flex-1 min-h-[50px] bg-slate-200 mt-3 group-hover:bg-blue-300 transition-colors"></div>
                </div>

                {/* Right Main Post Card Box */}
                <div className="flex-1 bg-white rounded-3xl border border-slate-200 hover:border-slate-300 p-5 sm:p-7 shadow-sm hover:shadow-md space-y-4 transition-all">
                  
                  {/* Author details & Bookmark */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-slate-900">{post.author.name}</span>
                        <span className="text-xs text-slate-400">{post.author.handle}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                        <span className="flex items-center gap-1 text-blue-600">
                          <MapPin className="w-3.5 h-3.5" />
                          {post.destination}, {post.country}
                        </span>
                        <span>•</span>
                        <span>{post.timeAgo}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleBookmark(post.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        post.isBookmarked
                          ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}
                      title="Bookmark Itinerary"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Trip Title & Badges */}
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                      {post.tripTitle}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.durationDisplay}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-100 flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {post.budgetDisplay}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200">
                        🏷️ {post.activityCategory}
                      </span>
                    </div>
                  </div>

                  {/* Caption Story */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {post.caption}
                  </p>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        onClick={() => setSearchQuery(tag.replace('#', ''))}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer bg-blue-50/50 px-2.5 py-0.5 rounded-md border border-blue-100/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Video or Photo Showcase */}
                  {post.videoUrl ? (
                    <VideoEmbed url={post.videoUrl} poster={post.photoUrl} />
                  ) : post.photoUrl ? (
                    <div className="relative rounded-2xl overflow-hidden max-h-80 border border-slate-100 shadow-sm group/photo">
                      <img
                        src={post.photoUrl}
                        alt={post.tripTitle}
                        className="w-full h-full object-cover group-hover/photo:scale-102 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                      <div className="absolute bottom-3 left-3 text-xs font-semibold text-white flex items-center gap-1.5 drop-shadow">
                        <Camera className="w-3.5 h-3.5 text-blue-300" />
                        <span>Photo by {post.author.name}</span>
                      </div>
                    </div>
                  ) : null}

                  {/* Key Itinerary Highlights */}
                  {post.itinerarySummary && (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <span className="font-bold text-slate-700 uppercase text-[10px] tracking-wider block">
                        Trip Highlights Roadmap
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {post.itinerarySummary.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-slate-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleLike(post.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                          post.isLiked
                            ? 'bg-rose-50 border-rose-200 text-rose-600'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                        <span>{post.likesCount}</span>
                      </button>

                      <button
                        onClick={() =>
                          setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.comments.length} Comments</span>
                      </button>

                      <button
                        onClick={() => alert('Trip link copied to clipboard!')}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        alert(`Cloned "${post.tripTitle}" into your Trip Planner!`);
                        navigate('/create-trip');
                      }}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 rounded-xl transition-all shadow-sm"
                    >
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      <span>Clone Itinerary</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Expandable Comments Thread */}
                  {activeCommentPostId === post.id && (
                    <div className="pt-4 border-t border-slate-100 space-y-3 animate-fade-in">
                      <div className="space-y-2">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                            <img
                              src={comment.authorAvatar}
                              alt={comment.author}
                              className="w-7 h-7 rounded-full object-cover mt-1"
                            />
                            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-800">{comment.author}</span>
                                <span className="text-[10px] text-slate-400">{comment.timeAgo}</span>
                              </div>
                              <p className="text-slate-600">{comment.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder="Write a comment or ask for advice..."
                          className="glass-input block w-full px-3.5 py-2 text-xs rounded-xl"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(post.id);
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow shrink-0"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ))}

          </div>
        ))}

        {filteredAndSortedPosts.length === 0 && (
          <div className="text-center py-16 rounded-3xl bg-white border border-slate-200 space-y-3">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-700 font-bold text-base">No experiences found</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No community posts matched your current search and filter criteria. Try adjusting your query.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterRegion('all');
                setGroupBy('none');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold mt-2"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* 4. CREATE EXPERIENCE MODAL */}
      {newPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
            
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-black tracking-tight">Share Your Trip Experience</h3>
              </div>
              <button
                onClick={() => setNewPostModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              {userTrips.length > 0 && (
                <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 space-y-1.5">
                  <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Auto-fill from your completed trip:
                  </label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => handleSelectTripToShare(e.target.value)}
                    className="w-full px-3 py-2 bg-white text-xs font-bold text-slate-800 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">-- Choose one of your trips --</option>
                    {userTrips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        ✈️ {trip.name} ({trip.stops?.length || 0} stops)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Trip / Experience Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. 5 Days in Santorini & Sunset Catamaran"
                  className="glass-input block w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Destination City</label>
                  <input
                    type="text"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="e.g. Santorini"
                    className="glass-input block w-full px-3.5 py-2.5 text-xs rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Region</label>
                  <select
                    value={newRegion}
                    onChange={(e) => setNewRegion(e.target.value as any)}
                    className="glass-input block w-full px-3.5 py-2.5 text-xs rounded-xl"
                  >
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Middle East">Middle East</option>
                    <option value="Africa">Africa</option>
                    <option value="Oceania">Oceania</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Activity Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="glass-input block w-full px-3 py-2 text-xs rounded-xl"
                  >
                    <option value="Sightseeing">Sightseeing</option>
                    <option value="Food & Wine">Food & Wine</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Culture & Temples">Culture & Temples</option>
                    <option value="Relaxation">Relaxation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Duration (Days)</label>
                  <input
                    type="number"
                    value={newDays}
                    onChange={(e) => setNewDays(Number(e.target.value))}
                    min={1}
                    className="glass-input block w-full px-3 py-2 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Est. Budget ($)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(Number(e.target.value))}
                    min={0}
                    className="glass-input block w-full px-3 py-2 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Story & Tips</label>
                <textarea
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  rows={3}
                  placeholder="Describe your travel tips, secret food spots, or transport advice..."
                  className="glass-input block w-full px-3.5 py-2.5 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Photo Image URL</label>
                  <input
                    type="url"
                    value={newPhoto}
                    onChange={(e) => setNewPhoto(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="glass-input block w-full px-3.5 py-2.5 text-xs rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Video Link URL (YouTube / Vimeo / MP4)</label>
                  <input
                    type="text"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="glass-input block w-full px-3.5 py-2.5 text-xs rounded-xl"
                  />
                </div>
              </div>

              {/* Sample Video Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-bold text-slate-400">Quick Video Link Samples:</span>
                <button
                  type="button"
                  onClick={() => setNewVideoUrl('https://www.youtube.com/watch?v=1La4QzGeaaQ')}
                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-[10px] font-bold transition-all"
                >
                  ▶️ Tokyo Vlog (YouTube)
                </button>
                <button
                  type="button"
                  onClick={() => setNewVideoUrl('https://www.youtube.com/watch?v=5qap5aO4i9A')}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-bold transition-all"
                >
                  🚁 Santorini Drone (YouTube)
                </button>
              </div>

              {/* Live Video Preview if entered */}
              {newVideoUrl && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-[11px] font-bold text-slate-500 block">Live Video Preview:</span>
                  <VideoEmbed url={newVideoUrl} />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md"
                >
                  Publish Experience
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};



