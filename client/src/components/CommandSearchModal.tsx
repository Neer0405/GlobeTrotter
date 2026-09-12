import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, Compass, Sparkles, X, ArrowRight, Activity as ActivityIcon } from 'lucide-react';
import api from '../api/client';
import { City, Trip } from '../types';

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandSearchModal: React.FC<CommandSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      const fetchSuggestions = async () => {
        try {
          setLoading(true);
          const [citiesRes, tripsRes] = await Promise.all([
            api.get('/cities'),
            api.get('/trips'),
          ]);
          setCities(citiesRes.data.cities || []);
          setTrips(tripsRes.data.trips || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchSuggestions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCities = cities.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.country.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTrips = trips.filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectCity = (city: City) => {
    onClose();
    navigate(`/cities`);
  };

  const handleSelectTrip = (tripId: string) => {
    onClose();
    navigate(`/builder/${tripId}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/70">
          <Search className="w-5 h-5 text-blue-600 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations, trips, activities (e.g. Paris, Colosseum)..."
            className="w-full bg-transparent text-slate-900 font-semibold placeholder:text-slate-400 text-base focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {/* Quick Actions */}
          {!query && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Navigation</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => { onClose(); navigate('/create-trip'); }}
                  className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-left transition-all text-xs font-bold flex flex-col gap-1"
                >
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Create Trip</span>
                </button>
                <button
                  onClick={() => { onClose(); navigate('/cities'); }}
                  className="p-3 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-left transition-all text-xs font-bold flex flex-col gap-1"
                >
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span>Explore Cities</span>
                </button>
                <button
                  onClick={() => { onClose(); navigate('/activities'); }}
                  className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-left transition-all text-xs font-bold flex flex-col gap-1"
                >
                  <ActivityIcon className="w-4 h-4 text-emerald-600" />
                  <span>Activities</span>
                </button>
                <button
                  onClick={() => { onClose(); navigate('/chat'); }}
                  className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-left transition-all text-xs font-bold flex flex-col gap-1"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>AI Assistant</span>
                </button>
              </div>
            </div>
          )}

          {/* Destinations Group */}
          {filteredCities.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Destinations</p>
              <div className="space-y-1">
                {filteredCities.slice(0, 5).map((city) => (
                  <div
                    key={city.id}
                    onClick={() => handleSelectCity(city)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={city.image_url}
                        alt={city.name}
                        className="w-9 h-9 rounded-lg object-cover"
                      />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{city.name}</p>
                        <p className="text-xs text-slate-500">{city.country} • {city.region}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Trips Group */}
          {filteredTrips.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your Trips</p>
              <div className="space-y-1">
                {filteredTrips.slice(0, 3).map((trip) => (
                  <div
                    key={trip.id}
                    onClick={() => handleSelectTrip(trip.id)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{trip.name}</p>
                        <p className="text-xs text-slate-500">{trip.stops?.length || 0} stops</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">Open Builder</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {query && filteredCities.length === 0 && filteredTrips.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-6">No matching destinations or itineraries found.</p>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-400 flex items-center justify-between px-6">
          <span>Tip: Use Search to jump straight to any city or trip</span>
          <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] font-mono">ESC to close</span>
        </div>

      </div>
    </div>
  );
};



