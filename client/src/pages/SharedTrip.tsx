import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Compass, Calendar, MapPin, Copy, Check, Globe, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Trip } from '../types';

export const SharedTrip: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState(false);
  const [error, setError] = useState('');
  const [copiedSuccess, setCopiedSuccess] = useState(false);

  useEffect(() => {
    fetchSharedTrip();
  }, [tripId]);

  const fetchSharedTrip = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/public/trips/${tripId}`);
      setTrip(res.data.trip);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Shared itinerary not found or is set to private.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrip = async () => {
    if (!user) {
      alert('Please log in or create an account to copy this trip itinerary into your dashboard.');
      navigate('/login');
      return;
    }

    try {
      setCopying(true);
      const res = await api.post(`/trips/${tripId}/copy`);
      setCopiedSuccess(true);
      setTimeout(() => {
        navigate(`/builder/${res.data.trip.id}`);
      }, 1500);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to copy trip.');
    } finally {
      setCopying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-20 text-slate-500 gap-3">
        <div className="w-10 h-10 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading Shared Travel Itinerary...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-panel p-10 rounded-3xl max-w-md w-full space-y-4 border border-slate-200">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Private or Missing Itinerary</h2>
          <p className="text-xs text-slate-500">{error}</p>
          <Link to="/" className="inline-block bg-brand-600 text-slate-900 text-xs font-bold px-5 py-2.5 rounded-xl">
            Go to GlobeTrotter Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-100 pb-16">
      {/* Top Banner Header */}
      <div className="glass-panel border-b border-slate-200 bg-slate-50/90 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Compass className="w-5 h-5 text-slate-900" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight">GlobeTrotter</span>
          </Link>

          <button
            onClick={handleCopyTrip}
            disabled={copying}
            className="bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-slate-900 text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
          >
            {copiedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" /> Copied to Your Account!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy Trip to My Account
              </>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-8 space-y-8">
        
        {/* Creator Header Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={trip.user?.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${trip.user?.name}`}
              alt={trip.user?.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-sky-500/40"
            />
            <div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" /> Shared Public Itinerary
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{trip.name}</h1>
              <p className="text-xs text-slate-500">Curated by {trip.user?.name || 'Explorer'}</p>
            </div>
          </div>

          <button
            onClick={handleCopyTrip}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-slate-900 text-xs font-bold px-5 py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" /> Clone This Itinerary
          </button>
        </div>

        {/* Cover Photo */}
        <div className="h-64 sm:h-80 rounded-3xl overflow-hidden border border-slate-200 relative">
          <img
            src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1000&q=80'}
            alt={trip.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs text-slate-600">
            <span className="bg-slate-50/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-400" />
              {new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Stops List */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400" /> Multi-City Route ({trip.stops.length} Cities)
          </h2>

          {trip.stops.map((stop, idx) => (
            <div key={stop.id} className="glass-panel p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-brand-600/30 text-sky-300 font-bold text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {stop.city.name}, <span className="text-xs text-slate-500">{stop.city.country}</span>
                  </h3>
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(stop.arrival_date).toLocaleDateString()} - {new Date(stop.departure_date).toLocaleDateString()}
                </span>
              </div>

              {/* Scheduled Activities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {stop.stop_activities?.map((sa) => (
                  <div key={sa.id} className="glass-card p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-sky-300 bg-slate-100 px-2 py-0.5 rounded">
                        {sa.activity.category}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        ${sa.cost_override ?? sa.activity.cost}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{sa.activity.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};



