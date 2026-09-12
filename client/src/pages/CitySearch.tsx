import React, { useEffect, useState, useMemo } from 'react';
import { Search, Filter, MapPin, Plus, DollarSign, X, Sparkles } from 'lucide-react';
import api from '../api/client';
import { City, Trip } from '../types';
import { CityCard } from '../components/CityCard';
import { CityDetailsModal } from '../components/CityDetailsModal';

export const CitySearch: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [maxCostIndex, setMaxCostIndex] = useState<number>(5);

  // Add to Trip Modal State
  const [targetCity, setTargetCity] = useState<City | null>(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');

  const [dynamicCities, setDynamicCities] = useState<City[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);

  // View Details Modal State
  const [clickedCity, setClickedCity] = useState<City | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchTerm.length >= 2) {
      const timer = setTimeout(() => {
        searchExternalCities(searchTerm);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setDynamicCities([]);
    }
  }, [searchTerm]);

  const searchExternalCities = async (query: string) => {
    try {
      setIsSearchingExternal(true);
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=12&language=en&format=json`);
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const mapped: City[] = data.results.map((ext: any) => ({
          id: `ext_${ext.id}`,
          name: ext.name,
          country: ext.country || ext.admin1 || 'Unknown',
          region: ext.admin1 || 'Global',
          cost_index: 3,
          popularity_score: Math.floor(Math.random() * 30) + 40, // 40-70
          image_url: `https://loremflickr.com/600/400/${encodeURIComponent(ext.name)},city,travel`,
          description: `Explore the vibrant destination of ${ext.name}, ${ext.country || ''}.`,
          _count: { activities: 0 }
        }));
        setDynamicCities(mapped);
      } else {
        setDynamicCities([]);
      }
    } catch (err) {
      console.error('Error fetching external cities:', err);
    } finally {
      setIsSearchingExternal(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citiesRes, tripsRes] = await Promise.all([
        api.get('/cities'),
        api.get('/trips'),
      ]);
      setCities(citiesRes.data.cities);
      setUserTrips(tripsRes.data.trips);
    } catch (err) {
      console.error('Error fetching cities:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = (city: City) => {
    setTargetCity(city);
    if (userTrips.length > 0) {
      setSelectedTripId(userTrips[0].id);
    }
  };

  const handleConfirmAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCity || !selectedTripId || !arrivalDate || !departureDate) {
      alert('Please fill out trip selection and stop dates.');
      return;
    }

    if (new Date(arrivalDate) > new Date(departureDate)) {
      alert('Arrival date cannot be after departure date.');
      return;
    }

    const targetTrip = userTrips.find(t => t.id === selectedTripId);
    if (targetTrip) {
      const tripStart = new Date(targetTrip.start_date).toISOString().split('T')[0];
      const tripEnd = new Date(targetTrip.end_date).toISOString().split('T')[0];
      if (arrivalDate < tripStart || arrivalDate > tripEnd || departureDate < tripStart || departureDate > tripEnd) {
        alert(`Stop dates must fall within the selected trip dates: ${tripStart} to ${tripEnd}`);
        return;
      }
    }

    try {
      // 1. Sync the city with our backend (creates it if it's dynamic/external)
      const syncRes = await api.post('/cities/sync', {
        name: targetCity.name,
        country: targetCity.country,
        region: targetCity.region
      });
      
      const realCityId = syncRes.data.city.id;

      // 2. Add stop using the real backend City ID
      await api.post(`/trips/${selectedTripId}/stops`, {
        city_id: realCityId,
        arrival_date: arrivalDate,
        departure_date: departureDate,
      });

      alert(`Added ${targetCity.name} stop to your trip!`);
      setTargetCity(null);
      setArrivalDate('');
      setDepartureDate('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adding stop.');
    }
  };

  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    cities.forEach((c) => { if (c.region) set.add(c.region); });
    dynamicCities.forEach((c) => { if (c.region) set.add(c.region); });
    const list = Array.from(set).filter(Boolean);
    return ['ALL', ...(list.length > 0 ? list : ['Europe', 'Asia', 'North America', 'South America', 'Africa', 'Oceania'])];
  }, [cities, dynamicCities]);

  const filteredCities = cities.filter((city) => {
    const matchesSearch =
      city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      city.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRegion =
      selectedRegion === 'ALL' ||
      (city.region && city.region.toLowerCase().includes(selectedRegion.toLowerCase())) ||
      (city.country && city.country.toLowerCase().includes(selectedRegion.toLowerCase()));

    const matchesCost = city.cost_index <= maxCostIndex;

    return matchesSearch && matchesRegion && matchesCost;
  });

  // If user is typing, show dynamic cities combined with local filtered cities
  const displayCities = searchTerm.length >= 2 ? [...filteredCities, ...dynamicCities] : filteredCities;
  // Deduplicate by name + country just in case
  const uniqueDisplayCities = Array.from(new Map(displayCities.map(c => [`${c.name}-${c.country}`, c])).values());

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore Destinations</h1>
        <p className="text-sm text-slate-500">Discover popular world cities, compare cost indexes, and add them to your trip itinerary</p>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-5 rounded-3xl border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search cities by name or country (e.g. Paris)..."
                className="glass-input block w-full pl-10 pr-4 py-3 text-sm rounded-xl transition-all"
              />
            </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex flex-col gap-2 min-w-[240px] px-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Max Budget / Day</span>
                </div>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {maxCostIndex === 1 && 'Up to $20'}
                  {maxCostIndex === 2 && 'Up to $50'}
                  {maxCostIndex === 3 && 'Up to $100'}
                  {maxCostIndex === 4 && 'Up to $250'}
                  {maxCostIndex === 5 && 'No Limit'}
                </span>
              </div>
              
              <div className="relative flex items-center h-5">
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={maxCostIndex}
                  onChange={(e) => setMaxCostIndex(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer outline-none accent-sky-500 hover:accent-sky-400 transition-all"
                  style={{
                    background: `linear-gradient(to right, #0ea5e9 ${((maxCostIndex - 1) / 4) * 100}%, #e2e8f0 ${((maxCostIndex - 1) / 4) * 100}%)`
                  }}
                />
              </div>
              <div className="flex justify-between px-1 text-[9px] font-bold text-slate-400">
                <span>Min</span>
                <span>Max</span>
              </div>
            </div>
          </div>
        </div>

        {/* Region Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1 custom-scrollbar">
          {availableRegions.map((reg) => (
            <button
              key={reg}
              onClick={() => setSelectedRegion(reg)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedRegion === reg
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 border border-blue-600'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {reg === 'ALL' ? 'All Regions' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* Cities Grid */}
      {loading || isSearchingExternal ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass-card h-80 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : uniqueDisplayCities.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl text-center space-y-3 border border-slate-200">
          <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-600">No destinations match your search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {uniqueDisplayCities.map((city) => (
            <CityCard key={city.id} city={city} onAddToTrip={handleOpenAddModal} onClick={() => setClickedCity(city)} />
          ))}
        </div>
      )}

      {/* Add City to Trip Modal */}
      {targetCity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" /> Add {targetCity.name} to Trip
              </h3>
              <button onClick={() => setTargetCity(null)} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {userTrips.length === 0 ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-600">You don't have any active trips created yet.</p>
                <a href="/create-trip" className="inline-block bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-500 transition-colors">
                  Create a Trip First
                </a>
              </div>
            ) : (
              <form onSubmit={handleConfirmAddStop} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Choose Target Trip *</label>
                  <select
                    value={selectedTripId}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="glass-input block w-full px-4 py-3 text-sm rounded-xl bg-white text-slate-900 border border-slate-300"
                    required
                  >
                    {userTrips.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const activeTrip = userTrips.find((t) => t.id === selectedTripId);
                    const tripStart = activeTrip ? activeTrip.start_date.split('T')[0] : today;
                    const tripEnd = activeTrip ? activeTrip.end_date.split('T')[0] : undefined;
                    return (
                      <>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Arrival Date *</label>
                          <input
                            type="date"
                            value={arrivalDate}
                            onChange={(e) => setArrivalDate(e.target.value)}
                            min={tripStart}
                            max={tripEnd}
                            className="glass-input block w-full px-3 py-2 text-xs rounded-xl text-slate-900"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Departure Date *</label>
                          <input
                            type="date"
                            value={departureDate}
                            onChange={(e) => setDepartureDate(e.target.value)}
                            min={arrivalDate || tripStart}
                            max={tripEnd}
                            className="glass-input block w-full px-3 py-2 text-xs rounded-xl text-slate-900"
                            required
                          />
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setTargetCity(null)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-colors"
                  >
                    Confirm Stop
                  </button>
                </div>
                
                <div className="text-center pt-3 border-t border-slate-100 mt-4">
                  <span className="text-xs text-slate-500">Don't want to use these trips? </span>
                  <a href="/create-trip" className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline">
                    Start a brand new trip
                  </a>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* City Details Modal */}
      {clickedCity && (
        <CityDetailsModal 
          city={clickedCity} 
          onClose={() => setClickedCity(null)}
          onAddToTrip={handleOpenAddModal}
        />
      )}

    </div>
  );
};



