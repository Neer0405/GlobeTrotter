import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, MapPin, Calendar, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-orange-400 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-slate-900">GlobeTrotter</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Plan your perfect multi-city trip across India with smart itineraries, real-time budgets, and curated activities.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/cities" className="text-sm text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Explore Cities
              </Link>
              <Link to="/my-trips" className="text-sm text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" /> My Trips
              </Link>
              <Link to="/community" className="text-sm text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" /> Community
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Features</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-500">
              <span>🗺️ Multi-city Itinerary Builder</span>
              <span>💰 Real-time Budget Calculator</span>
              <span>🏛️ Curated Indian Activities</span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} GlobeTrotter — India Travel Planner
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Travelers</span>
          </div>
        </div>
      </div>
    </footer>
  );
};



