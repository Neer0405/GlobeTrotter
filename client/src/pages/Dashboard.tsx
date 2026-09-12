import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, DollarSign, Calendar, Compass, ArrowRight, Search, Sparkles, TrendingUp, Sun, Plane, Globe, Layers } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Trip, City } from '../types';
import { TripCard } from '../components/TripCard';
import { CityCard } from '../components/CityCard';
import { CityDetailsModal } from '../components/CityDetailsModal';
export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [recommendedCities, setRecommendedCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [clickedCity, setClickedCity] = useState<City | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'cards'>('map');
  const [promptText, setPromptText] = useState('');
  const [isSearchingAi, setIsSearchingAi] = useState(false);
  const [aiCities, setAiCities] = useState<City[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tripsRes, citiesRes] = await Promise.all([
          api.get('/trips'),
          api.get('/cities'),
        ]);
        setTrips(tripsRes.data.trips || []);
        setRecommendedCities(citiesRes.data.cities || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalDestinationsCount = trips.reduce((sum, t) => sum + (t.stops?.length || 0), 0);
  const totalBudgetEstimate = trips.reduce((sum, t) => sum + (t.total_cost || 0), 0);

  const filteredCities = recommendedCities.filter(
    (city) =>
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTrips = trips.filter(
    (trip) =>
      trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.stops?.some((stop) => stop.city?.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAiPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    
    try {
      setIsSearchingAi(true);
      setAiCities([]);
      const res = await api.post('/cities/inspire', { prompt: promptText });
      setAiCities(res.data.cities || []);
    } catch (err) {
      console.error('Error fetching AI cities:', err);
      alert('AI Server Error. Please try again.');
    } finally {
      setIsSearchingAi(false);
    }
  };

  const upcomingTrip = trips.length > 0 ? trips[0] : null;

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      
      {/* 1. HERO BANNER WITH AI PROMPT BAR */}
      <div className="relative rounded-3xl overflow-hidden min-h-[340px] border border-slate-200/80 bg-slate-900 shadow-2xl flex flex-col justify-between p-8 sm:p-12 text-white">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=2000&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-blue-950/70"></div>
        
        {/* Decorative background glows */}
        <div className="absolute top-0 right-10 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/3 w-60 h-60 bg-amber-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {user?.name?.split(' ')[0] || 'Explorer'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Dream, Plan & Explore the World.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-xl">
            Custom multi-city itineraries, curated activities, and smart budget analytics at your fingertips.
          </p>
        </div>

        {/* AI Quick Itinerary Generator Prompt Box */}
        <div className="relative z-10 mt-8 max-w-2xl">
          <form onSubmit={handleAiPromptSubmit} className="relative flex items-center">
            <div className="absolute left-4 text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Ask AI: 'Plan a 5-day romantic trip to Paris & Rome under $2,000'..."
              className="w-full pl-12 pr-32 py-3.5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/20 transition-all shadow-xl"
            />
            <button
              type="submit"
              disabled={isSearchingAi}
              className="absolute right-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isSearchingAi ? 'Generating...' : 'Generate Itinerary'}
            </button>
          </form>
        </div>
      </div>

      {/* AI SUGGESTIONS (Inline) */}
      {(isSearchingAi || aiCities.length > 0) && (
        <div className="space-y-5 animate-fade-in p-6 glass-panel rounded-3xl border border-indigo-100 bg-indigo-50/30">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-600" />
              AI Suggestions
            </h2>
            <button onClick={() => setAiCities([])} className="text-xs font-bold text-slate-500 hover:text-slate-800">Clear</button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {isSearchingAi ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-72 glass-card rounded-2xl animate-pulse bg-indigo-200/50"></div>
              ))
            ) : (
              aiCities.map((city) => (
                <CityCard key={city.id} city={city} onClick={() => setClickedCity(city)} />
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. STATS & UPCOMING TRIP ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 cols: Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Itineraries</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900">{trips.length}</p>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                Active planner
              </p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Destinations</span>
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900">{totalDestinationsCount || 5}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Stops planned</p>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Estimated Budget</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-slate-900">${totalBudgetEstimate.toLocaleString()}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">Total estimated cost</p>
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div className="sm:col-span-3 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Plane className="w-4 h-4 text-blue-600" />
              <span>Ready for your next journey?</span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/create-trip"
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                New Trip
              </Link>
              <Link
                to="/cities"
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors"
              >
                Browse Cities
              </Link>
            </div>
          </div>
        </div>

        {/* Right 1 col: Spotlight Trip Card */}
        {upcomingTrip ? (
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden bg-gradient-to-br from-white via-slate-50 to-blue-50/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
                Featured Trip
              </span>
              <span className="text-xs font-bold text-slate-500">
                {new Date(upcomingTrip.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">{upcomingTrip.name}</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">{upcomingTrip.description || 'Exciting adventure scheduled.'}</p>
            </div>

            <div className="my-4 py-3 border-y border-slate-200/80 flex items-center justify-between text-xs text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Stops</span>
                <span className="font-extrabold text-slate-900">{upcomingTrip.stops?.length || 0} Cities</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Budget</span>
                <span className="font-extrabold text-emerald-600">${upcomingTrip.total_cost?.toLocaleString() || 0}</span>
              </div>
            </div>

            <Link
              to={`/builder/${upcomingTrip.id}`}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs text-center shadow transition-all flex items-center justify-center gap-1.5"
            >
              <span>Open Itinerary Builder</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <Calendar className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">No active trips</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Start creating your personalized travel plan.</p>
            <Link
              to="/create-trip"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs shadow hover:bg-blue-500 transition-colors"
            >
              Plan First Trip
            </Link>
          </div>
        )}

      </div>


      {/* 4. TOP DESTINATIONS SECTION */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Curated Global Destinations</h2>
            <p className="text-xs text-slate-500">Top-rated cities with verified local experiences and guides</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter cities..."
                className="glass-input pl-8 pr-3 py-1.5 text-xs rounded-xl w-48 font-medium"
              />
            </div>
            <Link
              to="/cities"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 whitespace-nowrap flex items-center gap-1"
            >
              All Destinations <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 glass-card rounded-2xl animate-pulse bg-slate-200/50"></div>
            ))
          ) : filteredCities.length > 0 ? (
            filteredCities.slice(0, 8).map((city) => (
              <CityCard key={city.id} city={city} onClick={() => setClickedCity(city)} />
            ))
          ) : (
            <div className="col-span-full text-center py-10 text-xs text-slate-400">
              No destinations found matching "{searchTerm}".
            </div>
          )}
        </div>
      </div>

      {/* 5. YOUR ITINERARIES SECTION */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Saved Itineraries</h2>
            <p className="text-xs text-slate-500">Manage stops, daily activities, and live budget tracking</p>
          </div>
          <Link
            to="/my-trips"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Trips <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 glass-card rounded-2xl animate-pulse bg-slate-200/50"></div>
            ))}
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTrips.slice(0, 4).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel rounded-3xl border border-slate-200">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No itineraries yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Create your first multi-destination travel itinerary with automatic routing and activity scheduling.
            </p>
            <Link
              to="/create-trip"
              className="inline-flex items-center gap-2 mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Start Planning Now
            </Link>
          </div>
        )}
      </div>

      {/* City Modal */}
      {clickedCity && (
        <CityDetailsModal
          city={clickedCity}
          onClose={() => setClickedCity(null)}
          onAddToTrip={() => {
            setClickedCity(null);
            navigate(`/create-trip`);
          }}
        />
      )}

    </div>
  );
};



