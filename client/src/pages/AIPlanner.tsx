import React, { useState, useEffect } from 'react';
import { Sparkles, MapPin, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/client';
import { City, Trip } from '../types';
import { CityCard } from '../components/CityCard';
import { CityDetailsModal } from '../components/CityDetailsModal';

export const AIPlanner: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [prompt, setPrompt] = useState(searchParams.get('prompt') || '');
  const [isSearchingAi, setIsSearchingAi] = useState(false);
  const [dynamicCities, setDynamicCities] = useState<City[]>([]);
  const hasAutoSearched = React.useRef(false);
  
  // To handle the "Add to Trip" flow exactly like Explore
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [targetCity, setTargetCity] = useState<City | null>(null);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [clickedCity, setClickedCity] = useState<City | null>(null);

  useEffect(() => {
    // Fetch trips to allow adding AI results to existing trips
    api.get('/trips').then(res => {
      setUserTrips(res.data.trips);
      if (res.data.trips.length > 0) {
        setSelectedTripId(res.data.trips[0].id);
      }
    }).catch(err => console.error(err));
  }, []);

  const performSearch = async (text: string) => {
    if (!text.trim()) return;
    try {
      setIsSearchingAi(true);
      setDynamicCities([]);
      const res = await api.post('/cities/inspire', { prompt: text });
      setDynamicCities(res.data.cities || []);
    } catch (err) {
      console.error('Error fetching AI cities:', err);
      alert('AI Server Error. Make sure you provided a valid Gemini API Key!');
    } finally {
      setIsSearchingAi(false);
    }
  };

  useEffect(() => {
    const urlPrompt = searchParams.get('prompt');
    if (urlPrompt && !hasAutoSearched.current) {
      hasAutoSearched.current = true;
      performSearch(urlPrompt);
    }
  }, [searchParams]);

  const handleInspire = async (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(prompt);
  };

  const handleOpenAddModal = (city: City) => {
    setTargetCity(city);
    setArrivalDate('');
    setDepartureDate('');
  };

  const handleConfirmAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCity || !selectedTripId) return;

    try {
      // 1. Sync the AI city with our backend
      const syncRes = await api.post('/cities/sync', {
        name: targetCity.name,
        country: targetCity.country,
        region: targetCity.region,
        description: targetCity.description,
        activities: targetCity.activities
      });
      
      const realCityId = syncRes.data.city.id;

      // 2. Add stop using the real backend City ID
      await api.post(`/trips/${selectedTripId}/stops`, {
        city_id: realCityId,
        arrival_date: new Date(arrivalDate).toISOString(),
        departure_date: new Date(departureDate).toISOString()
      });
      setTargetCity(null);
    } catch (err) {
      console.error('Error adding stop to trip:', err);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto space-y-12 pb-20">
      
      {/* Hero Section */}
      <div className="relative overflow-hidden glass-panel p-8 sm:p-16 rounded-[2.5rem] border border-indigo-200 bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 text-center">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            AI Travel Concierge
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Describe your dream <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">vacation.</span>
          </h1>
          <p className="text-lg text-slate-600 font-medium">
            Don't know where to go? Just tell us the vibe, your budget, or who you're traveling with. Our AI will curate the perfect destinations.
          </p>

          <form onSubmit={handleInspire} className="relative pt-6 max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A romantic beach holiday in Asia under $50/day..."
              className="flex-1 glass-input pl-6 pr-6 py-4 text-base rounded-2xl border-indigo-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-lg shadow-indigo-900/5 transition-all bg-white/80"
              required
            />
            <button
              type="submit"
              disabled={isSearchingAi}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-indigo-600/30 transition-all flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isSearchingAi ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Sparkles className="w-5 h-5 text-indigo-200" />
              )}
              Inspire Me
            </button>
          </form>
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-6">
        {(dynamicCities.length > 0 || isSearchingAi) && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Suggestions</h2>
          </div>
        )}

        {isSearchingAi ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-card h-80 rounded-2xl animate-pulse bg-white/50 border border-slate-100"></div>
            ))}
          </div>
        ) : dynamicCities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {dynamicCities.map((city) => (
              <CityCard key={city.id} city={city} onAddToTrip={handleOpenAddModal} onClick={() => setClickedCity(city)} />
            ))}
          </div>
        ) : null}
      </div>

      {/* Add to Trip Modal (Copied from Explore) */}
      {targetCity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" /> Add {targetCity.name} to Trip
              </h3>
              <button onClick={() => setTargetCity(null)} className="text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {userTrips.length === 0 ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-slate-600">You don't have any active trips created yet.</p>
                <a href="/create-trip" className="inline-block bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-indigo-500 transition-colors">
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
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-colors"
                  >
                    Confirm Stop
                  </button>
                </div>
                
                <div className="text-center pt-3 border-t border-slate-100 mt-4">
                  <span className="text-xs text-slate-500">Don't want to use these trips? </span>
                  <a href="/create-trip" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
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
        <CityDetailsModal city={clickedCity} onClose={() => setClickedCity(null)} />
      )}
    </div>
  );
};



