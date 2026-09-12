import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Compass, Calendar } from 'lucide-react';
import api from '../api/client';
import { Trip } from '../types';
import { TripCard } from '../components/TripCard';

export const MyTrips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'ONGOING' | 'UPCOMING' | 'COMPLETED'>('ALL');

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trips');
      setTrips(res.data.trips);
    } catch (err) {
      console.error('Error loading trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trip and all its stops?')) return;
    try {
      await api.delete(`/trips/${id}`);
      setTrips(trips.filter((t) => t.id !== id));
    } catch (err) {
      alert('Error deleting trip.');
    }
  };

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const searchFiltered = trips.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const ongoingTrips = searchFiltered.filter((t) => {
    const start = new Date(t.start_date); start.setHours(0, 0, 0, 0);
    const end = new Date(t.end_date); end.setHours(0, 0, 0, 0);
    return start <= todayDate && end >= todayDate;
  });

  const upcomingTrips = searchFiltered.filter((t) => {
    const start = new Date(t.start_date); start.setHours(0, 0, 0, 0);
    return start > todayDate;
  });

  const completedTrips = searchFiltered.filter((t) => {
    const end = new Date(t.end_date); end.setHours(0, 0, 0, 0);
    return end < todayDate;
  });

  const displayTrips = activeTab === 'ALL' ? searchFiltered
    : activeTab === 'ONGOING' ? ongoingTrips
    : activeTab === 'UPCOMING' ? upcomingTrips
    : completedTrips;

  const tabs = [
    { key: 'ALL' as const, label: 'All', count: searchFiltered.length },
    { key: 'ONGOING' as const, label: 'Ongoing', count: ongoingTrips.length },
    { key: 'UPCOMING' as const, label: 'Upcoming', count: upcomingTrips.length },
    { key: 'COMPLETED' as const, label: 'Completed', count: completedTrips.length },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Trips</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track all your travel plans</p>
        </div>
        <Link
          to="/create-trip"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 w-fit"
        >
          <Plus className="w-4 h-4" />
          Plan New Trip
        </Link>
      </div>

      {/* Search & Filter Tabs */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your trips..."
            className="glass-input block w-full pl-11 pr-4 py-3 text-sm rounded-xl"
          />
        </div>
        
        <div className="flex items-center gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === tab.key
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 glass-card rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : displayTrips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 glass-panel rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-medium">No trips found</p>
          <p className="text-sm text-slate-400 mt-1">
            {searchTerm ? `No results for "${searchTerm}"` : 'Create your first trip to get started!'}
          </p>
          {!searchTerm && (
            <Link
              to="/create-trip"
              className="inline-flex items-center gap-2 mt-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Trip
            </Link>
          )}
        </div>
      )}
    </div>
  );
};



