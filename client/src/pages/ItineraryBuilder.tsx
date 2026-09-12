import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Compass, Plus, Calendar, MapPin, Trash2, Clock, DollarSign, Eye,
  ChevronUp, ChevronDown, Check, X, Sparkles, AlertCircle, ArrowLeft, PlusCircle,
  Tag, Info, Edit3, AlertTriangle
} from 'lucide-react';
import api from '../api/client';
import { Trip, City, Activity, Stop, StopActivity } from '../types';
import { StopActivityPickerModal } from '../components/StopActivityPickerModal';

export const ItineraryBuilder: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [availableCities, setAvailableCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Stop State
  const [selectedCityId, setSelectedCityId] = useState('');
  const [arrivalDate, setArrivalDate] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [showAddStopModal, setShowAddStopModal] = useState(false);

  // Edit Stop State
  const [editingStop, setEditingStop] = useState<Stop | null>(null);
  const [editArrival, setEditArrival] = useState('');
  const [editDeparture, setEditDeparture] = useState('');

  // Stop Activity Picker State
  const [activeStop, setActiveStop] = useState<Stop | null>(null);
  const [cityActivities, setCityActivities] = useState<Activity[]>([]);
  const [timelineQuickViewActivity, setTimelineQuickViewActivity] = useState<{ activity: Activity; stopCityName: string } | null>(null);

  useEffect(() => {
    fetchTripAndCities();
  }, [tripId]);

  const fetchTripAndCities = async () => {
    try {
      setLoading(true);
      const [tripRes, citiesRes] = await Promise.all([
        api.get(`/trips/${tripId}`),
        api.get('/cities'),
      ]);
      setTrip(tripRes.data.trip);
      setAvailableCities(citiesRes.data.cities);
    } catch (err) {
      console.error('Error fetching builder data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    if (!selectedCityId || !arrivalDate || !departureDate) {
      alert('Please select a city, arrival date, and departure date.');
      return;
    }

    const start = new Date(arrivalDate);
    const end = new Date(departureDate);
    if (start > end) {
      alert('Arrival date cannot be after departure date.');
      return;
    }
    const tripStart = new Date(trip.start_date);
    const tripEnd = new Date(trip.end_date);
    if (start < tripStart || start > tripEnd || end < tripStart || end > tripEnd) {
      const tripStartStr = trip.start_date.split('T')[0];
      const tripEndStr = trip.end_date.split('T')[0];
      alert(`Stop dates must fall within trip dates: ${tripStartStr} to ${tripEndStr}`);
      return;
    }

    try {
      const res = await api.post(`/trips/${tripId}/stops`, {
        city_id: selectedCityId,
        arrival_date: arrivalDate,
        departure_date: departureDate,
      });

      setTrip((prev) => (prev ? { ...prev, stops: [...prev.stops, res.data.stop] } : null));
      setShowAddStopModal(false);
      setSelectedCityId('');
      setArrivalDate('');
      setDepartureDate('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add stop.');
    }
  };

  const handleUpdateStopDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStop || !trip) return;

    if (new Date(editArrival) > new Date(editDeparture)) {
      alert('Arrival date cannot be after departure date.');
      return;
    }

    const tripStart = new Date(trip.start_date);
    const tripEnd = new Date(trip.end_date);
    const start = new Date(editArrival);
    const end = new Date(editDeparture);

    if (start < tripStart || start > tripEnd || end < tripStart || end > tripEnd) {
      const tripStartStr = trip.start_date.split('T')[0];
      const tripEndStr = trip.end_date.split('T')[0];
      alert(`Stop dates must fall within trip dates: ${tripStartStr} to ${tripEndStr}`);
      return;
    }

    try {
      const res = await api.put(`/stops/${editingStop.id}`, {
        arrival_date: editArrival,
        departure_date: editDeparture,
      });

      setTrip((prev) =>
        prev
          ? {
              ...prev,
              stops: prev.stops.map((s) => (s.id === editingStop.id ? res.data.stop : s)),
            }
          : null
      );
      setEditingStop(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update stop dates.');
    }
  };

  const handleCitySelectChange = (cityId: string) => {
    setSelectedCityId(cityId);
    if (!cityId || !trip) return;

    // Smart date pre-filling
    if (trip.stops && trip.stops.length > 0) {
      const sorted = [...trip.stops].sort((a, b) => new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime());
      const lastStop = sorted[sorted.length - 1];
      const lastDepartureStr = lastStop.departure_date.split('T')[0];
      setArrivalDate(lastDepartureStr);
      setDepartureDate(trip.end_date.split('T')[0]);
    } else {
      setArrivalDate(trip.start_date.split('T')[0]);
      setDepartureDate(trip.end_date.split('T')[0]);
    }
  };

  const hasOverlap = (currentStop: Stop, allStops: Stop[]) => {
    const curStart = new Date(currentStop.arrival_date).getTime();
    const curEnd = new Date(currentStop.departure_date).getTime();

    return allStops.some((s) => {
      if (s.id === currentStop.id) return false;
      const sStart = new Date(s.arrival_date).getTime();
      const sEnd = new Date(s.departure_date).getTime();
      return curStart < sEnd && curEnd > sStart;
    });
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!window.confirm('Delete this city stop and all its scheduled activities?')) return;
    try {
      await api.delete(`/stops/${stopId}`);
      setTrip((prev) => (prev ? { ...prev, stops: prev.stops.filter((s) => s.id !== stopId) } : null));
      if (activeStop?.id === stopId) {
        setActiveStop(null);
      }
    } catch (err) {
      alert('Failed to delete stop.');
    }
  };

  const handleReorderStop = async (index: number, direction: 'UP' | 'DOWN') => {
    if (!trip) return;
    const newStops = [...trip.stops];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newStops.length) return;

    // Swap order_index
    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    const payload = newStops.map((s, i) => ({ id: s.id, order_index: i }));
    setTrip({ ...trip, stops: newStops });

    try {
      await api.put('/reorder', { stops: payload });
    } catch (err) {
      console.error('Failed to persist stop order');
    }
  };

  const openActivityPicker = async (stop: Stop) => {
    setActiveStop(stop);
    try {
      const res = await api.get(`/activities?city_id=${stop.city.id}`);
      setCityActivities(res.data.activities);
    } catch (err) {
      console.error('Error fetching city activities');
    }
  };

  const handleAddActivityToStop = async (activity: Activity) => {
    if (!activeStop) return;

    try {
      const res = await api.post(`/stops/${activeStop.id}/activities`, {
        activity_id: activity.id,
      });

      const newSa: StopActivity = res.data.stopActivity;
      
      // Update trip state
      setTrip((prev) => {
        if (!prev) return null;
        const updatedStops = prev.stops.map((s) => {
          if (s.id === activeStop.id) {
            return {
              ...s,
              stop_activities: [...s.stop_activities, newSa],
            };
          }
          return s;
        });
        return { ...prev, stops: updatedStops };
      });

      // Update active stop reference in modal
      setActiveStop((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          stop_activities: [...prev.stop_activities, newSa],
        };
      });
    } catch (err) {
      alert('Failed to add activity.');
    }
  };

  const handleDeleteStopActivity = async (stopId: string, stopActivityId: string) => {
    try {
      await api.delete(`/stop-activities/${stopActivityId}`);
      
      // Update trip state
      setTrip((prev) => {
        if (!prev) return null;
        const updatedStops = prev.stops.map((s) => {
          if (s.id === stopId) {
            return {
              ...s,
              stop_activities: s.stop_activities.filter((sa) => sa.id !== stopActivityId),
            };
          }
          return s;
        });
        return { ...prev, stops: updatedStops };
      });

      // Update active stop reference in modal if open
      if (activeStop && activeStop.id === stopId) {
        setActiveStop((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            stop_activities: prev.stop_activities.filter((sa) => sa.id !== stopActivityId),
          };
        });
      }
    } catch (err) {
      alert('Failed to delete activity.');
    }
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
        <p className="text-sm font-medium">Loading Itinerary Builder...</p>
      </div>
    );
  }

  // Sort stops by order_index
  const sortedStops = [...trip.stops].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Link to="/my-trips" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> My Trips
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{trip.name}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Build Itinerary</h1>
          <p className="text-sm text-slate-500">
            {formatDate(trip.start_date)} — {formatDate(trip.end_date)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to={`/trips/${trip.id}/budget`}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-emerald-100 shadow-sm transition-all"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            Budget Analytics
          </Link>
          <Link
            to={`/itinerary/${trip.id}`}
            className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 shadow-sm transition-all"
          >
            <Eye className="w-4 h-4 text-blue-500" />
            View Full Itinerary
          </Link>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Stops timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-500" /> Stop Timeline
            </h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {sortedStops.length} stops added
            </span>
          </div>

          {sortedStops.length === 0 ? (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4">
              <MapPin className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">No stops scheduled</h3>
                <p className="text-sm text-slate-500 max-w-sm mx-auto">
                  Start building your itinerary by selecting destinations and planning stops from the panel.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative pl-6 border-l border-slate-200/80 ml-4 space-y-8">
              {sortedStops.map((stop, index) => {
                const stopTotalCost = stop.stop_activities.reduce(
                  (acc, sa) => acc + (sa.cost_override ?? sa.activity.cost),
                  0
                );

                return (
                  <div key={stop.id} className="relative">
                    {/* Timeline bullet */}
                    <div className="absolute -left-[35px] top-4 w-7 h-7 rounded-full bg-blue-50 border-2 border-blue-500 flex items-center justify-center text-xs font-bold text-blue-600 shadow-sm">
                      {index + 1}
                    </div>

                    {/* Stop card */}
                    <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      
                      {/* Header bar */}
                      <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 bg-slate-50/50">
                        <div className="flex gap-4 items-center">
                          <img
                            src={stop.city.image_url}
                            alt={stop.city.name}
                            className="w-14 h-14 object-cover rounded-xl shrink-0 border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-lg font-bold text-slate-900">{stop.city.name}</h3>
                              <span className="text-xs text-slate-400 font-normal">({stop.city.country})</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-0.5">
                              <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                                {formatDate(stop.arrival_date)} — {formatDate(stop.departure_date)}
                              </p>
                              {hasOverlap(stop, trip.stops) && (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3 text-amber-500" /> Overlapping Dates
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingStop(stop);
                              setEditArrival(stop.arrival_date.split('T')[0]);
                              setEditDeparture(stop.departure_date.split('T')[0]);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 text-xs font-bold transition-all flex items-center gap-1"
                            title="Edit Stop Dates"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Dates</span>
                          </button>
                          <button
                            onClick={() => handleReorderStop(index, 'UP')}
                            disabled={index === 0}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Move Stop Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReorderStop(index, 'DOWN')}
                            disabled={index === sortedStops.length - 1}
                            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                            title="Move Stop Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <div className="w-px h-4 bg-slate-200 mx-1"></div>
                          <button
                            onClick={() => handleDeleteStop(stop.id)}
                            className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Stop"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Scheduled Activities list */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              Things To Do ({stop.stop_activities.length})
                            </h4>
                          </div>
                          {stop.stop_activities.length > 0 && (
                            <span className="text-xs font-bold text-emerald-600 flex items-center">
                              Est. Total: ${stopTotalCost}
                            </span>
                          )}
                        </div>

                        {stop.stop_activities.length === 0 ? (
                          <div className="text-center py-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/40">
                            <Compass className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                            <p className="text-xs text-slate-500 font-semibold">No activities scheduled for this stop yet</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Enrich your stay with sightseeing, culinary tours, or adventure.</p>
                            <button
                              onClick={() => openActivityPicker(stop)}
                              className="mt-3 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 mx-auto"
                            >
                              <Plus className="w-3.5 h-3.5" /> Browse & Add Activities
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            {stop.stop_activities.map((sa) => (
                              <div
                                key={sa.id}
                                className="flex items-center justify-between p-3 rounded-2xl border border-slate-150 bg-slate-50/70 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all group"
                              >
                                <div
                                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer pr-3"
                                  onClick={() => setTimelineQuickViewActivity({ activity: sa.activity, stopCityName: stop.city.name })}
                                >
                                  {sa.activity.image_url ? (
                                    <img
                                      src={sa.activity.image_url}
                                      alt={sa.activity.name}
                                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                                      <Compass className="w-5 h-5" />
                                    </div>
                                  )}

                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                      {sa.activity.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        {sa.activity.category}
                                      </span>
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                      <span className="text-[10px] font-bold text-emerald-600 flex items-center">
                                        <DollarSign className="w-2.5 h-2.5" />
                                        {sa.activity.cost}
                                      </span>
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-200"></span>
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        {sa.activity.duration_minutes}m
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => setTimelineQuickViewActivity({ activity: sa.activity, stopCityName: stop.city.name })}
                                    className="p-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Quick View Details"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteStopActivity(stop.id, sa.id)}
                                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Remove Activity from Stop"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add Activity Trigger */}
                        <button
                          onClick={() => openActivityPicker(stop)}
                          className="w-full py-2.5 border border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50/40 text-blue-600 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <PlusCircle className="w-4 h-4" />
                          Browse & Add Activities in {stop.city.name}
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Stop Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900">Add Destination</h2>
              <p className="text-xs text-slate-500">Insert a new city stop in your travel timeline</p>
            </div>

            <form onSubmit={handleAddStop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select Place
                </label>
                <select
                  value={selectedCityId}
                  onChange={(e) => handleCitySelectChange(e.target.value)}
                  className="glass-input block w-full px-4 py-3 text-sm rounded-xl border border-slate-200 font-semibold"
                  required
                >
                  <option value="">-- Choose a city stop --</option>
                  {availableCities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Arrival Date
                </label>
                <input
                  type="date"
                  value={arrivalDate}
                  min={trip.start_date.split('T')[0]}
                  max={trip.end_date.split('T')[0]}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="glass-input block w-full px-4 py-3 text-sm rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={departureDate}
                  min={arrivalDate || trip.start_date.split('T')[0]}
                  max={trip.end_date.split('T')[0]}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="glass-input block w-full px-4 py-3 text-sm rounded-xl border border-slate-200"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Stop to Itinerary
              </button>
            </form>
          </div>
        </div>

      </div>

      {/* Rich Stop Activity Picker Modal */}
      {activeStop && (
        <StopActivityPickerModal
          stop={activeStop}
          availableActivities={cityActivities}
          onAddActivity={handleAddActivityToStop}
          onRemoveActivity={(stopActivityId) => handleDeleteStopActivity(activeStop.id, stopActivityId)}
          onClose={() => setActiveStop(null)}
        />
      )}

      {/* Standalone Timeline Quick View Modal */}
      {timelineQuickViewActivity && (
        <div
          className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setTimelineQuickViewActivity(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-60 w-full bg-slate-900 overflow-hidden">
              {timelineQuickViewActivity.activity.image_url ? (
                <img
                  src={timelineQuickViewActivity.activity.image_url}
                  alt={timelineQuickViewActivity.activity.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800">
                  <Compass className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-xs font-bold uppercase tracking-wider">No Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

              <button
                onClick={() => setTimelineQuickViewActivity(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-5 left-6 right-6 space-y-1">
                <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-500/80 text-white border border-blue-400/40 inline-block">
                  {timelineQuickViewActivity.activity.category}
                </span>
                <h3 className="text-2xl font-extrabold text-white leading-tight">
                  {timelineQuickViewActivity.activity.name}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cost</p>
                  <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                    {timelineQuickViewActivity.activity.cost === 0 ? 'Free' : `$${timelineQuickViewActivity.activity.cost}`}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                  <p className="text-base font-extrabold text-slate-800 mt-0.5">
                    {timelineQuickViewActivity.activity.duration_minutes} mins
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stop</p>
                  <p className="text-base font-extrabold text-blue-600 mt-0.5 truncate">
                    {timelineQuickViewActivity.stopCityName}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-500" /> About this experience
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {timelineQuickViewActivity.activity.description || 'Enjoy this curated experience during your journey.'}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setTimelineQuickViewActivity(null)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Stop Dates Modal */}
      {editingStop && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" /> Edit Dates for {editingStop.city.name}
              </h3>
              <button onClick={() => setEditingStop(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStopDates} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Arrival Date *
                </label>
                <input
                  type="date"
                  value={editArrival}
                  min={trip.start_date.split('T')[0]}
                  max={trip.end_date.split('T')[0]}
                  onChange={(e) => setEditArrival(e.target.value)}
                  className="glass-input block w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Departure Date *
                </label>
                <input
                  type="date"
                  value={editDeparture}
                  min={editArrival || trip.start_date.split('T')[0]}
                  max={trip.end_date.split('T')[0]}
                  onChange={(e) => setEditDeparture(e.target.value)}
                  className="glass-input block w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingStop(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all"
                >
                  Save Stop Dates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};



