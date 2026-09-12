import React, { useState } from 'react';
import { Clock, DollarSign, Plus, Check, Tag, MapPin, Image as ImageIcon, Trash2, Eye } from 'lucide-react';
import { Activity } from '../types';

interface ActivityCardProps {
  activity: Activity;
  onAdd?: (activity: Activity) => void;
  onRemove?: (activity: Activity) => void;
  isAdded?: boolean;
  onClick?: () => void;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  culture: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '🏛️' },
  food: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: '🍜' },
  adventure: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: '🧗' },
  sightseeing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: '🗼' },
  relaxation: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: '🏖️' },
  shopping: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', icon: '🛍️' },
  nightlife: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200', icon: '🍸' },
};

const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  sightseeing: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&q=80',
  food: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
  culture: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=600&q=80',
  adventure: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80',
  relaxation: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80',
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ 
  activity, 
  onAdd, 
  onRemove, 
  isAdded, 
  onClick 
}) => {
  const [imageError, setImageError] = useState(false);

  const catKey = activity.category?.toLowerCase() || 'sightseeing';
  const catStyle = CATEGORY_STYLES[catKey] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    icon: '✨',
  };

  const imageSrc =
    !imageError && activity.image_url
      ? activity.image_url
      : CATEGORY_FALLBACK_IMAGES[catKey] || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&q=80';

  return (
    <div
      onClick={onClick}
      className={`glass-card rounded-3xl overflow-hidden border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 flex flex-col justify-between group bg-white ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      {/* Activity Image Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={activity.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20"></div>

        {/* Top Category Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-3 py-1 rounded-xl text-xs font-bold border backdrop-blur-md shadow-sm flex items-center gap-1.5 bg-white/90 ${catStyle.text} ${catStyle.border}`}
          >
            <span>{catStyle.icon}</span>
            <span>{activity.category}</span>
          </span>
        </div>

        {/* Top Right Price Tag */}
        <div className="absolute top-3 right-3">
          <span className="px-3 py-1 rounded-xl text-xs font-black bg-emerald-500 text-white shadow-md flex items-center gap-0.5">
            {activity.cost === 0 ? 'Free' : `$${activity.cost}`}
          </span>
        </div>

        {/* Bottom City & Duration strip */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-bold drop-shadow">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-300" />
            <span>{activity.duration_minutes} mins</span>
          </div>
          {activity.city && (
            <div className="flex items-center gap-1 text-slate-200 font-semibold bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md">
              <MapPin className="w-3 h-3 text-rose-400" />
              <span>{activity.city.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity Details & Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
            {activity.name}
          </h4>
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed font-normal">
            {activity.description || 'Experience this memorable activity and enrich your itinerary stop with authentic local adventures.'}
          </p>
        </div>

        {/* Action Button Strip */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onClick) onClick();
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>

          {/* Add / Remove Buttons */}
          <div className="flex items-center gap-1.5">
            {isAdded ? (
              <div className="flex items-center gap-1">
                <span className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Added
                </span>
                {onRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(activity);
                    }}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-colors"
                    title="Remove from stop"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : (
              onAdd && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAdd(activity);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add to Trip</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};



