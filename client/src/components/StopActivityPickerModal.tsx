import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Search, Filter, Compass, Clock, DollarSign, Tag, Plus, Check,
  Eye, Trash2, Sparkles, MapPin, SlidersHorizontal, ArrowUpDown, ChevronRight,
  Utensils, Mountain, Landmark, Heart, ShoppingBag, Moon, Sun, Info
} from 'lucide-react';
import { Activity, Stop, City, StopActivity } from '../types';

interface StopActivityPickerModalProps {
  stop: Stop;
  availableActivities: Activity[];
  onAddActivity: (activity: Activity) => Promise<void>;
  onRemoveActivity: (stopActivityId: string) => Promise<void>;
  onClose: () => void;
}

export const StopActivityPickerModal: React.FC<StopActivityPickerModalProps> = ({
  stop,
  availableActivities,
  onAddActivity,
  onRemoveActivity,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [costFilter, setCostFilter] = useState<'ALL' | 'FREE' | 'BUDGET' | 'MID' | 'PREMIUM'>('ALL');
  const [durationFilter, setDurationFilter] = useState<'ALL' | 'SHORT' | 'MEDIUM' | 'LONG'>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'COST_LOW' | 'COST_HIGH' | 'DURATION_SHORT' | 'DURATION_LONG'>('DEFAULT');
  const [quickViewActivity, setQuickViewActivity] = useState<Activity | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Prevent background scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Map of activityId -> StopActivity for easy lookup
  const addedActivityMap = useMemo(() => {
    const map = new Map<string, StopActivity>();
    stop.stop_activities.forEach((sa) => {
      map.set(sa.activity_id, sa);
    });
    return map;
  }, [stop.stop_activities]);

  const categories = [
    { id: 'ALL', label: 'All Experiences', icon: Compass },
    { id: 'Sightseeing', label: 'Sightseeing', icon: Landmark },
    { id: 'Food', label: 'Food & Culinary', icon: Utensils },
    { id: 'Adventure', label: 'Adventure', icon: Mountain },
    { id: 'Culture', label: 'Culture & Heritage', icon: Landmark },
    { id: 'Relaxation', label: 'Relaxation & Scenic', icon: Heart },
    { id: 'Shopping', label: 'Shopping', icon: ShoppingBag },
    { id: 'Nightlife', label: 'Nightlife', icon: Moon },
  ];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'culture':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'food':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'adventure':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'sightseeing':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'relaxation':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'shopping':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'nightlife':
        return 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredActivities = useMemo(() => {
    return availableActivities
      .filter((act) => {
        // Search filter
        const matchesSearch =
          act.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (act.description && act.description.toLowerCase().includes(searchTerm.toLowerCase()));

        // Category filter
        const matchesCat =
          selectedCategory === 'ALL' ||
          act.category.toLowerCase() === selectedCategory.toLowerCase();

        // Cost filter
        let matchesCost = true;
        if (costFilter === 'FREE') matchesCost = act.cost === 0;
        else if (costFilter === 'BUDGET') matchesCost = act.cost > 0 && act.cost <= 500;
        else if (costFilter === 'MID') matchesCost = act.cost > 500 && act.cost <= 2000;
        else if (costFilter === 'PREMIUM') matchesCost = act.cost > 2000;

        // Duration filter
        let matchesDuration = true;
        if (durationFilter === 'SHORT') matchesDuration = act.duration_minutes < 60;
        else if (durationFilter === 'MEDIUM') matchesDuration = act.duration_minutes >= 60 && act.duration_minutes <= 180;
        else if (durationFilter === 'LONG') matchesDuration = act.duration_minutes > 180;

        return matchesSearch && matchesCat && matchesCost && matchesDuration;
      })
      .sort((a, b) => {
        if (sortBy === 'COST_LOW') return a.cost - b.cost;
        if (sortBy === 'COST_HIGH') return b.cost - a.cost;
        if (sortBy === 'DURATION_SHORT') return a.duration_minutes - b.duration_minutes;
        if (sortBy === 'DURATION_LONG') return b.duration_minutes - a.duration_minutes;
        return 0;
      });
  }, [availableActivities, searchTerm, selectedCategory, costFilter, durationFilter, sortBy]);

  const handleToggleActivity = async (activity: Activity) => {
    const existing = addedActivityMap.get(activity.id);
    setProcessingId(activity.id);
    try {
      if (existing) {
        await onRemoveActivity(existing.id);
      } else {
        await onAddActivity(activity);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const totalStopCost = useMemo(() => {
    return stop.stop_activities.reduce((sum, sa) => sum + (sa.cost_override ?? sa.activity.cost), 0);
  }, [stop.stop_activities]);

  const totalStopDuration = useMemo(() => {
    return stop.stop_activities.reduce((sum, sa) => sum + (sa.activity?.duration_minutes || 0), 0);
  }, [stop.stop_activities]);

  const activeFilterCount =
    (selectedCategory !== 'ALL' ? 1 : 0) +
    (costFilter !== 'ALL' ? 1 : 0) +
    (durationFilter !== 'ALL' ? 1 : 0) +
    (searchTerm.trim() ? 1 : 0);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setCostFilter('ALL');
    setDurationFilter('ALL');
    setSortBy('DEFAULT');
  };

  return createPortal(
    <div className="fixed inset-0 z-[120] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-white to-slate-50 relative shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Things To Do
                </span>
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  {stop.city.name}, {stop.city.country}
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Browse Experiences for {stop.city.name}
              </h2>
              <p className="text-xs text-slate-500 max-w-xl">
                Enrich your trip with experiences like sightseeing, food tours, outdoor adventures, or cultural walks. Categorize by interest or budget to create your perfect itinerary.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar & Dropdowns */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search activities by name, keyword..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="sm:col-span-3">
              <select
                value={costFilter}
                onChange={(e) => setCostFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="ALL">💰 All Costs</option>
                <option value="FREE">🎉 Free Activities</option>
                <option value="BUDGET">🏷️ Budget (≤ $500)</option>
                <option value="MID">💎 Moderate ($500 - $2000)</option>
                <option value="PREMIUM">👑 Premium (&gt; $2000)</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={durationFilter}
                onChange={(e) => setDurationFilter(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
              >
                <option value="ALL">⏱️ All Durations</option>
                <option value="SHORT">⚡ Quick (&lt; 1 hr)</option>
                <option value="MEDIUM">⏳ Medium (1 - 3 hrs)</option>
                <option value="LONG">🌄 Full Experience (3+ hrs)</option>
              </select>
            </div>
          </div>

          {/* Interest / Category Pills */}
          <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory.toLowerCase() === cat.id.toLowerCase();
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/30'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Bar */}
        <div className="px-6 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-700">
              {filteredActivities.length} {filteredActivities.length === 1 ? 'Activity' : 'Activities'} found
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700 font-semibold underline underline-offset-2"
              >
                Clear filters ({activeFilterCount})
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-semibold text-slate-700 border-none focus:ring-0 text-xs py-0 pl-1 pr-6 cursor-pointer"
            >
              <option value="DEFAULT">Recommended</option>
              <option value="COST_LOW">Cost: Low to High</option>
              <option value="COST_HIGH">Cost: High to Low</option>
              <option value="DURATION_SHORT">Duration: Shortest</option>
              <option value="DURATION_LONG">Duration: Longest</option>
            </select>
          </div>
        </div>

        {/* Activity Cards List / Grid */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching activities found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try selecting a different interest category or resetting your search and price filters.
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-white border border-slate-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-slate-50 shadow-sm"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredActivities.map((activity) => {
                const isAdded = addedActivityMap.has(activity.id);
                const isProcessing = processingId === activity.id;

                return (
                  <div
                    key={activity.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group shadow-sm hover:shadow-md ${
                      isAdded
                        ? 'border-emerald-300 ring-1 ring-emerald-400/30 bg-emerald-50/10'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="p-4 space-y-3">
                      {/* Image Thumbnail & Category */}
                      <div className="flex items-start gap-3.5">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-150">
                          {activity.image_url ? (
                            <img
                              src={activity.image_url}
                              alt={activity.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                              <Compass className="w-7 h-7" />
                            </div>
                          )}
                          <button
                            onClick={() => setQuickViewActivity(activity)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity gap-1"
                            title="Quick View"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getCategoryColor(
                                activity.category
                              )}`}
                            >
                              {activity.category}
                            </span>
                            <span className="text-xs font-black text-emerald-600 flex items-center">
                              {activity.cost === 0 ? 'Free' : `$${activity.cost}`}
                            </span>
                          </div>

                          <h4
                            onClick={() => setQuickViewActivity(activity)}
                            className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
                          >
                            {activity.name}
                          </h4>

                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {activity.description || 'Experience this memorable activity during your visit.'}
                          </p>
                        </div>
                      </div>

                      {/* Meta info */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-blue-500" />
                          <span>{activity.duration_minutes} mins</span>
                        </div>
                        <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                        <div className="flex items-center gap-1 text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span>{stop.city.name}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Bar (Quick View & Add/Remove Button) */}
                    <div className="px-4 py-2.5 bg-slate-50/90 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setQuickViewActivity(activity)}
                        className="text-xs font-bold text-slate-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Quick View
                      </button>

                      <button
                        onClick={() => handleToggleActivity(activity)}
                        disabled={isProcessing}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                          isAdded
                            ? 'bg-emerald-600 hover:bg-rose-600 text-white shadow-emerald-600/20 hover:shadow-rose-600/20 group/btn'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                        }`}
                      >
                        {isProcessing ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5 group-hover/btn:hidden" />
                            <Trash2 className="w-3.5 h-3.5 hidden group-hover/btn:inline" />
                            <span className="group-hover/btn:hidden">Added</span>
                            <span className="hidden group-hover/btn:inline">Remove</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to Stop</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Summary & Close */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-lg">
          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>
                <strong className="text-slate-900 font-bold">{stop.stop_activities.length}</strong> activities selected
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Est. Cost: <strong className="text-emerald-700 font-bold">${totalStopCost}</strong></span>
            </div>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>Duration: <strong className="text-slate-900 font-bold">{totalStopDuration} mins</strong></span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            Done Scheduling
          </button>
        </div>

      </div>

      {/* Nested Quick View Modal */}
      {quickViewActivity && (
        <div
          className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setQuickViewActivity(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Quick View Image Banner */}
            <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
              {quickViewActivity.image_url ? (
                <img
                  src={quickViewActivity.image_url}
                  alt={quickViewActivity.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-800">
                  <Compass className="w-12 h-12 mb-2 opacity-50" />
                  <span className="text-xs font-bold uppercase tracking-wider">No Image Available</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>

              <button
                onClick={() => setQuickViewActivity(null)}
                className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-5 left-6 right-6 space-y-1">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border inline-block ${getCategoryColor(
                    quickViewActivity.category
                  )}`}
                >
                  {quickViewActivity.category}
                </span>
                <h3 className="text-2xl font-extrabold text-white leading-tight">
                  {quickViewActivity.name}
                </h3>
              </div>
            </div>

            {/* Quick View Info & Details */}
            <div className="p-6 space-y-6">
              {/* Highlight Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Cost</p>
                  <p className="text-base font-extrabold text-emerald-600 mt-0.5">
                    {quickViewActivity.cost === 0 ? 'Free' : `$${quickViewActivity.cost}`}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                  <p className="text-base font-extrabold text-slate-800 mt-0.5">
                    {quickViewActivity.duration_minutes} mins
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Destination</p>
                  <p className="text-base font-extrabold text-blue-600 mt-0.5 truncate">
                    {stop.city.name}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-500" /> Experience Description
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {quickViewActivity.description ||
                    'This curated experience lets you dive into the authentic sights, tastes, and culture of the region. Plan ahead and book tickets if required.'}
                </p>
              </div>

              {/* Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => setQuickViewActivity(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Back to List
                </button>

                {(() => {
                  const isAdded = addedActivityMap.has(quickViewActivity.id);
                  const isProcessing = processingId === quickViewActivity.id;

                  return (
                    <button
                      onClick={() => handleToggleActivity(quickViewActivity)}
                      disabled={isProcessing}
                      className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                        isAdded
                          ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                          : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                      }`}
                    >
                      {isProcessing ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : isAdded ? (
                        <>
                          <Trash2 className="w-4 h-4" /> Remove from Stop
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" /> Add to {stop.city.name} Stop
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};



