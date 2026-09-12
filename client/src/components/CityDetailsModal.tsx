import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Star, DollarSign, Activity as ActivityIcon } from 'lucide-react';
import { City, Activity as ActivityType } from '../types';
import api from '../api/client';

interface CityDetailsModalProps {
  city: City;
  onClose: () => void;
  onAddToTrip?: (city: City) => void;
}

export const CityDetailsModal: React.FC<CityDetailsModalProps> = ({ city, onClose, onAddToTrip }) => {
  const [fullCity, setFullCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch full city details
    setLoading(true);
    api.get(`/cities/${city.id}`)
      .then(res => setFullCity(res.data.city))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Apply scroll lock and padding to body
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    // Apply padding to sticky navbar to prevent its alignment change
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      // Cleanup on unmount
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (navbar) {
        navbar.style.paddingRight = '';
      }
    };
  }, [city.id]);

  const displayCity = fullCity || city;

  const modalContent = (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="glass-panel max-w-2xl w-full rounded-3xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-72 sm:h-96 w-full shrink-0">
          <img src={displayCity.image_url} alt={displayCity.name} className="w-full h-full object-cover" />
          
          {/* Gradient Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-black/40 pointer-events-none"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/80 text-white backdrop-blur-md shadow-lg shadow-sky-500/30 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {displayCity.country} {displayCity.region ? `• ${displayCity.region}` : ''}
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg">
              {displayCity.name}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-white flex-1">
          <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div>
                <p className="text-[10px] font-bold uppercase text-amber-600/70 leading-none mb-0.5">Popularity</p>
                <p className="text-sm font-bold text-amber-700 leading-none">{displayCity.popularity_score}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-100">
              <div className="bg-emerald-200/50 p-1 rounded-full">
                <DollarSign className="w-3 h-3 text-emerald-700" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-emerald-600/70 leading-none mb-0.5">Cost Index</p>
                <p className="text-sm font-bold text-emerald-700 leading-none">{displayCity.cost_index} / 5</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-sky-400 rounded-full"></span>
                About this destination
              </h3>
              <p className="text-slate-600 leading-relaxed text-base">
                {displayCity.description || 'A vibrant tourist destination with exciting local activities and heritage sites. Explore the beautiful scenery and cultural landmarks.'}
              </p>
            </div>

            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                <div className="h-20 bg-slate-200 rounded-2xl w-full"></div>
              </div>
            ) : displayCity.activities && displayCity.activities.length > 0 ? (
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-blue-400 rounded-full"></span>
                  Top Activities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {displayCity.activities.slice(0, 4).map((activity: ActivityType) => (
                    <div key={activity.id} className="flex gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-md hover:border-blue-200 transition-all group">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-200">
                        {activity.image_url ? (
                          <img src={activity.image_url} alt={activity.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <ActivityIcon className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">{activity.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{activity.category}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span className="text-[10px] font-bold text-emerald-600">${activity.cost}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 shadow-xl flex items-center justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
              
              <div className="relative z-10 flex items-center gap-4">
                <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 text-sky-400 shadow-inner">
                  <ActivityIcon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Total Activities</p>
                  <p className="text-2xl font-black text-white">{displayCity.activities?.length || displayCity._count?.activities || 0} <span className="text-sm font-semibold text-slate-400 ml-1">Available</span></p>
                </div>
              </div>
              
              {onAddToTrip && (
                <button
                  onClick={() => {
                    onClose();
                    onAddToTrip(displayCity);
                  }}
                  className="relative z-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white px-6 py-3 rounded-xl text-sm font-extrabold shadow-lg shadow-blue-600/20 transition-all transform hover:scale-105 active:scale-95"
                >
                  Add to Trip
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};



