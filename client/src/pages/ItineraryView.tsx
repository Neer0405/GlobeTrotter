import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Compass, Calendar, Clock, MapPin, Share2, Edit3, PieChart, Tag,
  CheckCircle2, ChevronDown, ChevronUp, Layers, List, Grid, Search,
  ArrowLeft, DollarSign, AlertTriangle, Sparkles, Building,
  Plane, BedDouble, Utensils, Mountain
} from 'lucide-react';
import api from '../api/client';
import { Trip, Stop } from '../types';

export const ItineraryView: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [expandedStops, setExpandedStops] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/trips/${tripId}`);
      setTrip(res.data.trip);

      const initialExpanded: Record<string, boolean> = {};
      res.data.trip.stops.forEach((s: Stop) => {
        initialExpanded[s.id] = true;
      });
      setExpandedStops(initialExpanded);
    } catch (err) {
      console.error('Error fetching itinerary:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (stopId: string) => {
    setExpandedStops((prev) => ({ ...prev, [stopId]: !prev[stopId] }));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading || !trip) {
    return (
      <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading Itinerary Details...</p>
      </div>
    );
  }

  // Calculate total activities cost and duration
  let totalActivitiesCost = 0;
  let totalActivitiesCount = 0;
  trip.stops.forEach((s) => {
    s.stop_activities.forEach((sa) => {
      totalActivitiesCost += sa.cost_override ?? sa.activity?.cost ?? 0;
      totalActivitiesCount++;
    });
  });

  const sortedStops = [...trip.stops].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in pb-16">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/my-trips"
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Trips
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{trip.name}</h1>
          <p className="text-sm text-slate-500 flex items-center gap-2 mt-0.5">
            <Calendar className="w-4 h-4 text-blue-500" />
            {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
            <span>•</span>
            <span>{trip.stops.length} Destinations</span>
            <span>•</span>
            <span>{totalActivitiesCount} Experiences</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/trips/${trip.id}/budget`}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-emerald-100 shadow-sm transition-all"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Financial Analytics & Budget
          </Link>

          <Link
            to={`/itinerary/builder/${trip.id}`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-500 shadow-md shadow-blue-600/20 transition-all"
          >
            <Edit3 className="w-4 h-4" />
            Edit Itinerary
          </Link>
        </div>
      </div>

      {/* Summary Financial Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Scheduled Activities</span>
          <p className="text-xl font-extrabold text-blue-600">${totalActivitiesCost.toLocaleString()}</p>
          <p className="text-[11px] text-slate-400">{totalActivitiesCount} total experiences</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Destinations / Stops</span>
          <p className="text-xl font-extrabold text-slate-900">{trip.stops.length}</p>
          <p className="text-[11px] text-slate-400">Multi-city schedule</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Budget Status</span>
          <p className="text-xl font-extrabold text-emerald-600 flex items-center gap-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Active
          </p>
          <p className="text-[11px] text-slate-400">Expense tracking enabled</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Analytics</span>
          <Link
            to={`/trips/${trip.id}/budget`}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 pt-1"
          >
            View Charts & Breakdown →
          </Link>
          <p className="text-[10px] text-slate-400">Transport, Stay, Meals</p>
        </div>
      </div>

      {/* Main Stops & Itinerary Timeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-600" /> Destination Stops & Activities Timeline
          </h2>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {sortedStops.length} stops
          </span>
        </div>

        {sortedStops.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Compass className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No stops scheduled in this itinerary</h3>
            <p className="text-xs text-slate-500">Start planning your stops and activities in the builder.</p>
            <Link
              to={`/itinerary/builder/${trip.id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500"
            >
              <Edit3 className="w-4 h-4" /> Open Itinerary Builder
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedStops.map((stop, idx) => {
              const isExpanded = expandedStops[stop.id] ?? true;
              const stopCost = stop.stop_activities.reduce(
                (sum, sa) => sum + (sa.cost_override ?? sa.activity?.cost ?? 0),
                0
              );

              return (
                <div
                  key={stop.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Stop Banner Header */}
                  <div
                    onClick={() => toggleExpand(stop.id)}
                    className="p-5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                        {idx + 1}
                      </div>

                      <img
                        src={stop.city.image_url}
                        alt={stop.city.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{stop.city.name}</h3>
                          <span className="text-xs text-slate-400 font-medium">({stop.city.country})</span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-blue-500" />
                          {formatDate(stop.arrival_date)} — {formatDate(stop.departure_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-bold text-slate-900 block">
                          ${stopCost.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {stop.stop_activities.length} activities
                        </span>
                      </div>
                      <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-200/50 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Stop Activities List */}
                  {isExpanded && (
                    <div className="p-5 space-y-3">
                      {stop.stop_activities.length === 0 ? (
                        <div className="text-center py-6 text-slate-400 text-xs italic">
                          No specific activities added for {stop.city.name}. Click "Edit Itinerary" to browse sightseeing & experiences.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {stop.stop_activities.map((sa) => (
                            <div
                              key={sa.id}
                              className="p-3.5 rounded-2xl border border-slate-150 bg-slate-50/50 flex items-center gap-3.5 hover:bg-white hover:border-blue-200 transition-all shadow-2xs"
                            >
                              {sa.activity?.image_url ? (
                                <img
                                  src={sa.activity.image_url}
                                  alt=""
                                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                  <Compass className="w-5 h-5" />
                                </div>
                              )}

                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                  {sa.activity?.name || 'Experience'}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5 text-xs">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                    {sa.activity?.category}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="text-[11px] font-bold text-emerald-600">
                                    ${sa.cost_override ?? sa.activity?.cost ?? 0}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                  <span className="text-[11px] text-slate-400">
                                    {sa.activity?.duration_minutes}m
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};



