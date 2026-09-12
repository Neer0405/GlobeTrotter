import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, DollarSign, Share2, Trash2, Edit3, Eye, Lock, Globe, Loader2 } from 'lucide-react';
import { Trip } from '../types';
import api from '../api/client';

interface TripCardProps {
  trip: Trip;
  onDelete?: (id: string) => void;
  onTogglePublic?: (id: string, isPublic: boolean) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onDelete, onTogglePublic }) => {
  const navigate = useNavigate();
  const [isPublic, setIsPublic] = useState(trip.is_public);
  const [toggling, setToggling] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const citiesList = trip.stops?.map((s) => s.city.name).join(' → ') || 'No cities added';

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.actions-container')) {
      navigate(`/builder/${trip.id}`);
    }
  };

  const handleTogglePublic = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (toggling) return;

    const nextState = !isPublic;
    try {
      setToggling(true);
      await api.put(`/trips/${trip.id}`, { is_public: nextState });
      setIsPublic(nextState);
      if (onTogglePublic) {
        onTogglePublic(trip.id, nextState);
      }
    } catch (err) {
      alert('Failed to update trip privacy status.');
    } finally {
      setToggling(false);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="glass-card rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-300 transition-all duration-300 group flex flex-col cursor-pointer"
    >
      
      {/* Cover Photo */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80'}
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent"></div>

        {/* Interactive Public / Private Toggle Badge */}
        <div className="absolute top-3 right-3 actions-container z-10">
          <button
            type="button"
            onClick={handleTogglePublic}
            disabled={toggling}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold backdrop-blur-md border flex items-center gap-1.5 shadow-md transition-all transform hover:scale-105 active:scale-95 cursor-pointer ${
              isPublic
                ? 'bg-emerald-500/90 hover:bg-emerald-600 border-emerald-400 text-white'
                : 'bg-slate-900/80 hover:bg-slate-900 border-slate-700 text-slate-200'
            }`}
            title={isPublic ? 'Click to make Private (Only visible to you)' : 'Click to make Public (Visible in Community)'}
          >
            {toggling ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : isPublic ? (
              <>
                <Globe className="w-3.5 h-3.5 text-emerald-200" /> Public
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-slate-300" /> Private
              </>
            )}
          </button>
        </div>

        {/* Date Range Badge */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-medium">
              {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            </span>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {trip.name}
          </h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {trip.description || 'No description provided.'}
          </p>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="truncate font-medium">{citiesList}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs actions-container">
          <div className="flex items-center gap-3">
            <span className="text-slate-500">
              <strong className="text-slate-800 font-semibold">{trip.stops?.length || 0}</strong> Stops
            </span>
            {trip.total_cost !== undefined && trip.total_cost > 0 && (
              <span className="flex items-center text-emerald-600 font-semibold">
                <DollarSign className="w-3.5 h-3.5" />
                {trip.total_cost.toLocaleString()}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            <Link
              to={`/builder/${trip.id}`}
              className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors border border-transparent hover:border-blue-200"
              title="Edit Itinerary"
            >
              <Edit3 className="w-4 h-4" />
            </Link>
            <Link
              to={`/itinerary/${trip.id}`}
              className="p-2 rounded-lg bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-500 transition-colors border border-transparent hover:border-blue-200"
              title="View Itinerary"
            >
              <Eye className="w-4 h-4" />
            </Link>
            <Link
              to={`/community?share_trip_id=${trip.id}`}
              className="p-2 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-500 transition-colors border border-transparent hover:border-indigo-200"
              title="Share Experience in Community"
            >
              <Share2 className="w-4 h-4" />
            </Link>
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(trip.id);
                }}
                className="p-2 rounded-lg bg-slate-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors border border-transparent hover:border-rose-200"
                title="Delete Trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
