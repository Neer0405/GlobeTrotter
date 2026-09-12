import React, { useEffect, useState, useMemo } from 'react';
import { 
  Search, Filter, Compass, MapPin, X, Clock, Tag, DollarSign, Plus, 
  CheckCircle2, ArrowRight, Trash2, Eye, Sparkles, SlidersHorizontal, 
  Check, Calendar, Layers, AlertCircle, ShoppingBag
} from 'lucide-react';
import api from '../api/client';
import { Activity, City, Trip, Stop } from '../types';
import { ActivityCard } from '../components/ActivityCard';
import { useNavigate } from 'react-router-dom';

export const ActivitySearch: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCostTier, setSelectedCostTier] = useState<'ALL' | 'free' | 'budget' | 'mid' | 'luxury'>('ALL');
  const [selectedDurationTier, setSelectedDurationTier] = useState<'ALL' | 'quick' | 'half' | 'extended' | 'fullday'>('ALL');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'duration'>('recommended');

  // Active Trip & Stop Targeting
  const [selectedTripId, setSelectedTripId] = useState<string>('NONE');
  const [selectedStopId, setSelectedStopId] = useState<string>('NONE');

  // Track added activities mapped by stop or activity ID
  const [addedActivityIds, setAddedActivityIds] = useState<Set<string>>(new Set());
  const [addedActivitiesList, setAddedActivitiesList] = useState<Activity[]>([]);

  // Quick View Modal
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [assignModalActivity, setAssignModalActivity] = useState<Activity | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [actRes, cityRes, tripsRes] = await Promise.all([
        api.get('/activities'),
        api.get('/cities'),
        api.get('/trips'),
      ]);

      const fetchedActivities: Activity[] = actRes.data.activities || [];
      const fetchedCities: City[] = cityRes.data.cities || [];
      const fetchedTrips: Trip[] = tripsRes.data.trips || [];

      setActivities(fetchedActivities);
      setCities(fetchedCities);
      setTrips(fetchedTrips);

      // Pre-select first trip and stop if available
      if (fetchedTrips.length > 0) {
        setSelectedTripId(fetchedTrips[0].id);
        if (fetchedTrips[0].stops && fetchedTrips[0].stops.length > 0) {
          const firstStop = fetchedTrips[0].stops[0];
          setSelectedStopId(firstStop.id);
          // Set city filter to match this stop
          setSelectedCityId(firstStop.city_id);

          // Populate already scheduled activities
          const existingIds = new Set<string>();
          fetchedTrips[0].stops.forEach((st) => {
            st.stop_activities?.forEach((sa) => {
              existingIds.add(sa.activity_id);
            });
          });
          setAddedActivityIds(existingIds);
        }
      }
    } catch (err) {
      console.error('Error fetching activities:', err);
    } finally {
      setLoading(false);
    }
  };

  // When selected trip changes, update stop selector and added activities
  const handleTripChange = (tripId: string) => {
    setSelectedTripId(tripId);
    if (tripId === 'NONE') {
      setSelectedStopId('NONE');
      setSelectedCityId('ALL');
      setAddedActivityIds(new Set());
      setAddedActivitiesList([]);
      return;
    }

    const currentTrip = trips.find((t) => t.id === tripId);
    if (currentTrip && currentTrip.stops && currentTrip.stops.length > 0) {
      const firstStop = currentTrip.stops[0];
      setSelectedStopId(firstStop.id);
      setSelectedCityId(firstStop.city_id);

      const existingIds = new Set<string>();
      currentTrip.stops.forEach((st) => {
        st.stop_activities?.forEach((sa) => {
          existingIds.add(sa.activity_id);
        });
      });
      setAddedActivityIds(existingIds);
    } else {
      setSelectedStopId('NONE');
    }
  };

  // When selected stop changes, filter to that city
  const handleStopChange = (stopId: string) => {
    setSelectedStopId(stopId);
    if (stopId !== 'NONE') {
      const currentTrip = trips.find((t) => t.id === selectedTripId);
      const stop = currentTrip?.stops.find((s) => s.id === stopId);
      if (stop) {
        setSelectedCityId(stop.city_id);
      }
    }
  };

  // Add Activity to currently active Stop
  const handleAddActivity = async (activity: Activity) => {
    // If no stop selected, show assignment modal
    if (selectedStopId === 'NONE' || selectedTripId === 'NONE') {
      setAssignModalActivity(activity);
      return;
    }

    try {
      // Call backend to attach activity to stop
      await api.post(`/stops/${selectedStopId}/activities`, {
        activity_id: activity.id,
      });

      // Update state
      setAddedActivityIds((prev) => new Set([...prev, activity.id]));
      setAddedActivitiesList((prev) => [...prev, activity]);
    } catch (err) {
      console.error('Error adding activity to stop:', err);
      // Optimistic local update
      setAddedActivityIds((prev) => new Set([...prev, activity.id]));
      setAddedActivitiesList((prev) => [...prev, activity]);
    }
  };

  // Remove Activity from Stop
  const handleRemoveActivity = async (activity: Activity) => {
    try {
      setAddedActivityIds((prev) => {
        const next = new Set(prev);
        next.delete(activity.id);
        return next;
      });
      setAddedActivitiesList((prev) => prev.filter((a) => a.id !== activity.id));
    } catch (err) {
      console.error('Error removing activity:', err);
    }
  };

  // Assign to selected stop from modal
  const handleConfirmAssign = async (targetStopId: string) => {
    if (!assignModalActivity || !targetStopId) return;
    try {
      await api.post(`/stops/${targetStopId}/activities`, {
        activity_id: assignModalActivity.id,
      });
      setAddedActivityIds((prev) => new Set([...prev, assignModalActivity.id]));
      setAddedActivitiesList((prev) => [...prev, assignModalActivity]);
      setAssignModalActivity(null);
    } catch (err) {
      setAddedActivityIds((prev) => new Set([...prev, assignModalActivity.id]));
      setAddedActivitiesList((prev) => [...prev, assignModalActivity]);
      setAssignModalActivity(null);
    }
  };

  // Multi-attribute filter logic
  const filteredActivities = useMemo(() => {
    return activities
      .filter((act) => {
        // 1. Search text
        const matchesSearch =
          act.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (act.description && act.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // 2. City / Stop
        const matchesCity = selectedCityId === 'ALL' || act.city_id === selectedCityId;

        // 3. Category / Interest
        const matchesCat =
          selectedCategory === 'ALL' || act.category.toLowerCase() === selectedCategory.toLowerCase();

        // 4. Cost Tier
        let matchesCost = true;
        if (selectedCostTier === 'free') matchesCost = act.cost === 0;
        else if (selectedCostTier === 'budget') matchesCost = act.cost > 0 && act.cost <= 30;
        else if (selectedCostTier === 'mid') matchesCost = act.cost > 30 && act.cost <= 75;
        else if (selectedCostTier === 'luxury') matchesCost = act.cost > 75;

        // 5. Duration Tier
        let matchesDuration = true;
        if (selectedDurationTier === 'quick') matchesDuration = act.duration_minutes <= 60;
        else if (selectedDurationTier === 'half') matchesDuration = act.duration_minutes > 60 && act.duration_minutes <= 180;
        else if (selectedDurationTier === 'extended') matchesDuration = act.duration_minutes > 180 && act.duration_minutes <= 300;
        else if (selectedDurationTier === 'fullday') matchesDuration = act.duration_minutes > 300;

        return matchesSearch && matchesCity && matchesCat && matchesCost && matchesDuration;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.cost - b.cost;
        if (sortBy === 'price_high') return b.cost - a.cost;
        if (sortBy === 'duration') return b.duration_minutes - a.duration_minutes;
        return 0;
      });
  }, [activities, searchTerm, selectedCityId, selectedCategory, selectedCostTier, selectedDurationTier, sortBy]);

  const interestCategories = [
    { id: 'ALL', label: 'All Interests', icon: '✨' },
    { id: 'Sightseeing', label: 'Sightseeing', icon: '🗼' },
    { id: 'Food', label: 'Food & Dining', icon: '🍜' },
    { id: 'Culture', label: 'Culture & Temples', icon: '🏛️' },
    { id: 'Adventure', label: 'Adventure & Nature', icon: '🧗' },
    { id: 'Relaxation', label: 'Relaxation & Spa', icon: '🏖️' },
  ];

  const currentTrip = trips.find((t) => t.id === selectedTripId);
  const currentStop = currentTrip?.stops.find((s) => s.id === selectedStopId);

  const totalAddedCost = addedActivitiesList.reduce((sum, a) => sum + (a.cost || 0), 0);

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in pb-20">
      
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-extrabold text-xs uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Itinerary Experiences</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Activities & Experiences
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse and select things to do in each stop, categorized by interest or cost
          </p>
        </div>

        <button
          onClick={() => navigate('/create-trip')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Trip</span>
        </button>
      </div>

      {/* 2. ITINERARY STOP PLANNER SELECTOR BAR (Select which trip & stop to enrich) */}
      <div className="glass-panel p-5 rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700 block">
              Currently Planning For Stop:
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-0.5">
              {/* Trip Selector */}
              <select
                value={selectedTripId}
                onChange={(e) => handleTripChange(e.target.value)}
                className="bg-white border border-blue-200 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="NONE">🌍 Explore All Worldwide Cities</option>
                {trips.map((t) => (
                  <option key={t.id} value={t.id}>
                    ✈️ {t.name}
                  </option>
                ))}
              </select>

              {/* Stop Selector (if trip selected) */}
              {currentTrip && currentTrip.stops && currentTrip.stops.length > 0 && (
                <select
                  value={selectedStopId}
                  onChange={(e) => handleStopChange(e.target.value)}
                  className="bg-white border border-blue-200 text-slate-900 text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {currentTrip.stops.map((stop, idx) => (
                    <option key={stop.id} value={stop.id}>
                      Stop #{idx + 1}: {stop.city?.name || 'City'} ({new Date(stop.arrival_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {/* Running Stop Tally Badge */}
        {selectedStopId !== 'NONE' && (
          <div className="flex items-center gap-3 bg-white p-2.5 px-4 rounded-2xl border border-blue-100 shadow-sm shrink-0">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Selected Stop</span>
              <span className="text-xs font-black text-slate-900">{currentStop?.city?.name || 'Destination'}</span>
            </div>
            <div className="h-6 w-px bg-slate-200"></div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Added</span>
              <span className="text-xs font-black text-blue-600">{addedActivityIds.size} Experiences</span>
            </div>
            {selectedTripId !== 'NONE' && (
              <button
                onClick={() => navigate(`/builder/${selectedTripId}`)}
                className="ml-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
              >
                <span>View Schedule</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. MULTI-ATTRIBUTE FILTERS & SEARCH TOOLBAR (Interest, Cost, Duration, City) */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 bg-white shadow-sm space-y-5">
        
        {/* Row 1: Search, Destination City, Sort by */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-6">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search activities by keyword (e.g. Eiffel Tower, Wine Tasting, Volcano, Sushi)..."
              className="glass-input block w-full pl-11 pr-4 py-2.5 text-xs font-medium rounded-xl"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="relative md:col-span-3">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="glass-input block w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-xl appearance-none cursor-pointer"
            >
              <option value="ALL">All Destinations</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} ({city.country})
                </option>
              ))}
            </select>
          </div>

          <div className="relative md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="glass-input block w-full px-4 py-2.5 text-xs font-bold rounded-xl appearance-none cursor-pointer"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="price_low">Cost: Lowest First ($)</option>
              <option value="price_high">Cost: Highest First ($$$)</option>
              <option value="duration">Duration: Longest First</option>
            </select>
          </div>
        </div>

        {/* Row 2: Interest Categories */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Categorized by Interest:
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {interestCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm shrink-0 flex items-center gap-1.5 ${
                  selectedCategory.toLowerCase() === cat.id.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-blue-500/20'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Row 3: Cost & Duration Tier Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          {/* Cost Tiers */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Filter by Cost:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'All Costs' },
                { id: 'free', label: 'Free ($0)' },
                { id: 'budget', label: 'Under $30' },
                { id: 'mid', label: '$30 - $75' },
                { id: 'luxury', label: '$75+' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setSelectedCostTier(tier.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedCostTier === tier.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration Tiers */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Filter by Duration:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'ALL', label: 'All Durations' },
                { id: 'quick', label: '< 1 hr' },
                { id: 'half', label: '1 - 3 hrs' },
                { id: 'extended', label: '3 - 5 hrs' },
                { id: 'fullday', label: 'Full Day (5h+)' },
              ].map((dur) => (
                <button
                  key={dur.id}
                  onClick={() => setSelectedDurationTier(dur.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedDurationTier === dur.id
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 4. ACTIVITY RESULTS GRID WITH HIGH-RES PHOTOS, QUICK VIEW, ADD/REMOVE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Showing <strong className="text-blue-600">{filteredActivities.length}</strong> matching activities
          </h3>
          {(selectedCategory !== 'ALL' || selectedCostTier !== 'ALL' || selectedDurationTier !== 'ALL' || selectedCityId !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCityId('ALL');
                setSelectedCategory('ALL');
                setSelectedCostTier('ALL');
                setSelectedDurationTier('ALL');
              }}
              className="text-xs font-bold text-rose-600 hover:underline"
            >
              Reset all filters
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 glass-card rounded-3xl animate-pulse bg-slate-100"></div>
            ))}
          </div>
        ) : filteredActivities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => {
              const cityInfo = cities.find((c) => c.id === act.city_id);
              const activityWithCity = { ...act, city: cityInfo };
              const isAdded = addedActivityIds.has(act.id);

              return (
                <ActivityCard
                  key={act.id}
                  activity={activityWithCity}
                  isAdded={isAdded}
                  onAdd={() => handleAddActivity(activityWithCity)}
                  onRemove={() => handleRemoveActivity(activityWithCity)}
                  onClick={() => setSelectedActivity(activityWithCity)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 glass-panel rounded-3xl border border-slate-200 bg-white space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-slate-700 font-bold text-base">No experiences match your criteria</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your interest category, cost tier, duration range or destination city.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCityId('ALL');
                setSelectedCategory('ALL');
                setSelectedCostTier('ALL');
                setSelectedDurationTier('ALL');
              }}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-500 transition-colors mt-2"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* 5. QUICK VIEW DETAILS MODAL */}
      {selectedActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-900">
            
            {/* Header Image */}
            <div className="relative h-72 w-full bg-slate-100 rounded-t-3xl overflow-hidden">
              <img
                src={selectedActivity.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'}
                alt={selectedActivity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-black/25 to-transparent"></div>
              
              <button 
                onClick={() => setSelectedActivity(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="px-3 py-1 bg-blue-600 text-white text-xs font-black rounded-lg mb-2 inline-block shadow-sm">
                  {selectedActivity.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">{selectedActivity.name}</h2>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100">
                  <span className="text-[10px] text-blue-700 font-bold uppercase block">Destination</span>
                  <span className="text-xs font-black text-slate-900">
                    {cities.find((c) => c.id === selectedActivity.city_id)?.name || 'Global'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">Cost</span>
                  <span className="text-xs font-black text-emerald-700">
                    {selectedActivity.cost === 0 ? 'Free' : `$${selectedActivity.cost}`}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold uppercase block">Duration</span>
                  <span className="text-xs font-black text-slate-900">
                    {selectedActivity.duration_minutes} mins
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Experience Description</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-normal">
                  {selectedActivity.description || 'Explore this iconic destination experience and enrich your travel memory with authentic local sights, culinary delights, and unforgettable adventures.'}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedActivity(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {addedActivityIds.has(selectedActivity.id) ? (
                    <button
                      onClick={() => {
                        handleRemoveActivity(selectedActivity);
                        setSelectedActivity(null);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Remove from Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleAddActivity(selectedActivity);
                        setSelectedActivity(null);
                      }}
                      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add to Itinerary Stop</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 6. ASSIGN TO SPECIFIC TRIP STOP MODAL (If clicked when no stop is active) */}
      {assignModalActivity && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-slate-900 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Add to Itinerary Stop</h3>
              <button
                onClick={() => setAssignModalActivity(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Select which stop to add <strong className="text-slate-900">{assignModalActivity.name}</strong> to:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {trips.length > 0 ? (
                trips.map((trip) => (
                  <div key={trip.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-blue-600" />
                      {trip.name}
                    </p>
                    <div className="space-y-1 pl-4">
                      {trip.stops?.map((stop, idx) => (
                        <button
                          key={stop.id}
                          onClick={() => handleConfirmAssign(stop.id)}
                          className="w-full text-left p-2 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-700 flex items-center justify-between transition-colors"
                        >
                          <span>Stop #{idx + 1}: {stop.city?.name}</span>
                          <span className="text-[10px] text-blue-600 font-bold">Add +</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-500">No active trips found.</p>
                  <button
                    onClick={() => {
                      setAssignModalActivity(null);
                      navigate('/create-trip');
                    }}
                    className="mt-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
                  >
                    Create a Trip First
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAssignModalActivity(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};



