import React from 'react';
import { MapPin, Star, Plus } from 'lucide-react';
import { City } from '../types';

interface CityCardProps {
  city: City;
  onAddToTrip?: (city: City) => void;
  isSaved?: boolean;
  onToggleSave?: (cityId: string) => void;
  onClick?: () => void;
}

export const CityCard: React.FC<CityCardProps> = ({ city, onAddToTrip, isSaved, onToggleSave, onClick }) => {
  return (
    <div 
      className={`glass-card rounded-2xl overflow-hidden border border-slate-200 hover:border-blue-300 transition-all duration-300 group flex flex-col ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      
      {/* City Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={city.image_url}
          alt={city.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Region / Country Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 flex items-center gap-1 shadow-sm">
            <MapPin className="w-3 h-3 text-blue-500" />
            {city.country}
          </span>
        </div>

        {/* Popularity Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50/90 border border-amber-200 text-amber-700 backdrop-blur-md flex items-center gap-1 shadow-sm">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            {city.popularity_score}%
          </span>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent"></div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {city.name}
          </h3>
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {city.description || 'Vibrant tourist destination with exciting local activities and heritage sites.'}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            <strong className="text-slate-800 font-semibold">{city.activities?.length || city._count?.activities || 0}</strong> Activities
          </span>

          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleSave(city.id); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSaved
                    ? 'bg-rose-50 border-rose-200 text-rose-600'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {isSaved ? 'Saved' : 'Save'}
              </button>
            )}

            {onAddToTrip && (
              <button
                onClick={(e) => { e.stopPropagation(); onAddToTrip(city); }}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add to Trip
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};



