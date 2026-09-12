import React, { useState } from 'react';
import { City } from '../types';
import { MapPin, Compass, Sparkles, Star, DollarSign, ArrowRight, Eye } from 'lucide-react';

interface InteractiveWorldMapProps {
  cities: City[];
  onSelectCity?: (city: City) => void;
  selectedCityId?: string;
  activeTripStops?: { cityName: string; order: number }[];
}

// Normalized coordinate mapping (0-100% x/y relative to standard Equirectangular projection)
const CITY_COORDINATES: Record<string, { x: number; y: number; flag: string }> = {
  'Paris': { x: 49.2, y: 31.8, flag: '🇫🇷' },
  'Tokyo': { x: 86.8, y: 38.6, flag: '🇯🇵' },
  'Rome': { x: 51.5, y: 35.8, flag: '🇮🇹' },
  'New York City': { x: 28.5, y: 34.5, flag: '🇺🇸' },
  'Bali': { x: 82.5, y: 62.0, flag: '🇮🇩' },
  'Barcelona': { x: 48.5, y: 35.5, flag: '🇪🇸' },
  'Kyoto': { x: 85.5, y: 39.2, flag: '🇯🇵' },
  'Sydney': { x: 91.0, y: 78.5, flag: '🇦🇺' },
  'London': { x: 48.0, y: 30.0, flag: '🇬🇧' },
  'Dubai': { x: 62.8, y: 43.5, flag: '🇦🇪' },
  'Cape Town': { x: 54.0, y: 77.0, flag: '🇿🇦' },
  'Amsterdam': { x: 49.0, y: 29.5, flag: '🇳🇱' },
  'Rio de Janeiro': { x: 37.0, y: 71.0, flag: '🇧🇷' },
  'Bangkok': { x: 77.0, y: 49.5, flag: '🇹🇭' },
  'Reykjavik': { x: 43.0, y: 20.0, flag: '🇮🇸' },
  'Santorini': { x: 54.5, y: 37.5, flag: '🇬🇷' },
};

export const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
  cities,
  onSelectCity,
  selectedCityId,
  activeTripStops,
}) => {
  const [hoveredCity, setHoveredCity] = useState<City | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('All');

  const regions = ['All', 'Europe', 'Asia', 'North America', 'South America', 'Middle East', 'Africa', 'Oceania'];

  const filteredCities = cities.filter((city) => {
    if (activeRegion === 'All') return true;
    return city.region === activeRegion;
  });

  return (
    <div className="relative glass-panel rounded-3xl p-6 border border-slate-200 shadow-xl overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 text-white">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header controls */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4 animate-spin-slow" />
            <span>Interactive World Explorer</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Global Destinations & Routes
          </h3>
        </div>

        {/* Region Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full custom-scrollbar">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeRegion === region
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white border border-white/5'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full aspect-[2/1] min-h-[320px] max-h-[520px] rounded-2xl bg-slate-950/80 border border-slate-800/80 overflow-hidden shadow-inner flex items-center justify-center select-none">
        
        {/* World Map SVG Vector Base */}
        <svg
          viewBox="0 0 1000 500"
          className="w-full h-full object-contain opacity-35 transition-opacity duration-300"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.04)" strokeWidth="1" />
            </pattern>
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          <rect width="1000" height="500" fill="url(#grid)" />

          {/* Continents Outlines (Stylized Clean World Shapes) */}
          <g fill="rgba(255, 255, 255, 0.12)" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1">
            {/* North America */}
            <path d="M 120 70 Q 180 60 260 80 Q 320 120 280 200 Q 230 250 210 270 Q 180 210 140 180 Q 100 130 120 70 Z" />
            {/* South America */}
            <path d="M 280 270 Q 370 290 380 370 Q 350 450 310 460 Q 280 400 270 330 Z" />
            {/* Europe */}
            <path d="M 460 80 Q 550 70 560 140 Q 520 200 460 190 Q 430 150 460 80 Z" />
            {/* Africa */}
            <path d="M 460 200 Q 580 200 580 300 Q 560 410 500 420 Q 450 340 450 250 Z" />
            {/* Asia */}
            <path d="M 570 80 Q 820 60 860 170 Q 820 290 680 270 Q 600 230 570 150 Z" />
            {/* Australia */}
            <path d="M 800 340 Q 920 330 920 420 Q 850 450 790 400 Z" />
            {/* Great Britain & Iceland */}
            <circle cx="445" cy="130" r="14" />
            <circle cx="420" cy="90" r="10" />
            {/* Japan */}
            <ellipse cx="875" cy="180" rx="14" ry="24" transform="rotate(30 875 180)" />
            {/* Indonesia archipelago */}
            <ellipse cx="800" cy="300" rx="35" ry="10" />
          </g>

          {/* Active Trip Route Curves (Connecting demo route Paris -> Rome -> Barcelona -> Tokyo) */}
          <path
            d="M 492 159 C 500 165, 510 175, 515 179 C 500 180, 490 176, 485 177 C 650 150, 750 150, 868 193"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
        </svg>

        {/* City Markers & Pins */}
        {filteredCities.map((city) => {
          const coords = CITY_COORDINATES[city.name] || { x: 50, y: 50, flag: '📍' };
          const isSelected = selectedCityId === city.id;
          const isHovered = hoveredCity?.id === city.id;

          return (
            <div
              key={city.id}
              style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group"
              onMouseEnter={() => setHoveredCity(city)}
              onMouseLeave={() => setHoveredCity(null)}
              onClick={() => onSelectCity && onSelectCity(city)}
            >
              {/* Outer pulsing ping */}
              <div
                className={`absolute inset-0 rounded-full animate-ping opacity-60 ${
                  isSelected ? 'bg-orange-400 scale-150' : 'bg-blue-400'
                }`}
              ></div>

              {/* Pin Node */}
              <div
                className={`relative flex items-center justify-center rounded-full transition-all duration-300 shadow-lg ${
                  isSelected
                    ? 'w-7 h-7 bg-gradient-to-r from-orange-500 to-amber-400 text-white ring-4 ring-orange-500/40 scale-125'
                    : isHovered
                    ? 'w-6 h-6 bg-blue-500 text-white ring-4 ring-blue-400/40 scale-115'
                    : 'w-4 h-4 bg-white border-2 border-blue-600 hover:scale-125'
                }`}
              >
                {isHovered || isSelected ? (
                  <span className="text-[10px] leading-none">{coords.flag}</span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                )}
              </div>

              {/* Label below pin */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap transition-all pointer-events-none shadow-md ${
                  isSelected || isHovered
                    ? 'bg-slate-900/95 text-white border border-slate-700 opacity-100 scale-100 z-30'
                    : 'bg-slate-900/70 text-slate-300 opacity-0 group-hover:opacity-100 scale-95'
                }`}
              >
                {city.name}
              </div>
            </div>
          );
        })}

        {/* Interactive Floating Hover Card */}
        {hoveredCity && (
          <div
            className="absolute bottom-4 right-4 z-40 w-72 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 p-4 shadow-2xl animate-fade-in text-left pointer-events-auto"
            onMouseEnter={() => setHoveredCity(hoveredCity)}
            onMouseLeave={() => setHoveredCity(null)}
          >
            <div className="relative h-28 rounded-xl overflow-hidden mb-3">
              <img
                src={hoveredCity.image_url}
                alt={hoveredCity.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-2 left-2.5">
                <span className="text-base font-black text-white">{hoveredCity.name}</span>
                <span className="block text-xs text-slate-300 font-medium">{hoveredCity.country}</span>
              </div>
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 font-extrabold text-[10px] flex items-center gap-1 shadow">
                <Star className="w-3 h-3 fill-slate-950" />
                {hoveredCity.popularity_score}%
              </div>
            </div>

            <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
              {hoveredCity.description}
            </p>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                {hoveredCity.activities?.length || 5} Activities
              </span>
              <button
                onClick={() => onSelectCity && onSelectCity(hoveredCity)}
                className="flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                View Details <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Quick stats footer */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800/80 text-center">
        <div>
          <span className="block text-xl font-black text-white">{cities.length || 16}</span>
          <span className="text-xs text-slate-400">Curated Cities</span>
        </div>
        <div>
          <span className="block text-xl font-black text-blue-400">80+</span>
          <span className="text-xs text-slate-400">Top Activities</span>
        </div>
        <div>
          <span className="block text-xl font-black text-amber-400">6</span>
          <span className="text-xs text-slate-400">Global Continents</span>
        </div>
        <div>
          <span className="block text-xl font-black text-emerald-400">100%</span>
          <span className="text-xs text-slate-400">Verified Guides</span>
        </div>
      </div>

    </div>
  );
};



