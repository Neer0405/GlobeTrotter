import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  PieChart as PieIcon, BarChart2, DollarSign, AlertTriangle, Plus, Trash2,
  Calendar, Compass, ArrowLeft, X, TrendingUp, ShieldAlert,
  CheckCircle2, BedDouble, Plane, Utensils, Mountain, Layers, Sliders,
  HelpCircle, ChevronRight, Info
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Legend, AreaChart, Area
} from 'recharts';
import api from '../api/client';
import { BudgetSummary, DayWiseExpense } from '../types';

export const TripBudget: React.FC = () => {
  const { id: tripId } = useParams<{ id: string }>();
  const [budgetData, setBudgetData] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [customThreshold, setCustomThreshold] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DAILY' | 'ITEMS'>('OVERVIEW');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Manual Budget Item Modal State
  const [showItemModal, setShowItemModal] = useState(false);
  const [category, setCategory] = useState<'Transport' | 'Stay' | 'Activity' | 'Food' | 'Other'>('Transport');
  const [itemName, setItemName] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchBudget();
  }, [tripId, customThreshold]);

  const fetchBudget = async () => {
    try {
      setLoading(true);
      const url = customThreshold
        ? `/trips/${tripId}/budget?threshold=${customThreshold}`
        : `/trips/${tripId}/budget`;
      const res = await api.get(url);
      setBudgetData(res.data);
      if (customThreshold === null && res.data.summary.threshold) {
        setCustomThreshold(res.data.summary.threshold);
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !estimatedCost) return;

    try {
      await api.post(`/trips/${tripId}/budget-items`, {
        category,
        name: itemName,
        estimated_cost: Number(estimatedCost),
        actual_cost: actualCost ? Number(actualCost) : undefined,
        notes,
      });

      setShowItemModal(false);
      setItemName('');
      setEstimatedCost('');
      setActualCost('');
      setNotes('');
      fetchBudget();
    } catch (err) {
      alert('Error adding budget item.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await api.delete(`/budget-items/${itemId}`);
      fetchBudget();
    } catch (err) {
      alert('Error deleting budget item.');
    }
  };

  const CATEGORY_COLORS: Record<string, string> = {
    'Stay (Hotels)': '#3b82f6',
    'Stay': '#3b82f6',
    'Activities & Tours': '#0ea5e9',
    'Activities': '#0ea5e9',
    'Activity': '#0ea5e9',
    'Meals & Dining': '#f59e0b',
    'Food': '#f59e0b',
    'Transport & Flights': '#8b5cf6',
    'Transport': '#8b5cf6',
    'Other Expenses': '#10b981',
    'Other': '#10b981',
  };

  const filteredBudgetItems = useMemo(() => {
    if (!budgetData) return [];
    if (selectedCategoryFilter === 'ALL') return budgetData.budgetItems;
    return budgetData.budgetItems.filter(
      (item) => item.category.toLowerCase() === selectedCategoryFilter.toLowerCase()
    );
  }, [budgetData, selectedCategoryFilter]);

  if (loading && !budgetData) {
    return (
      <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Calculating Trip Financial Analytics...</p>
      </div>
    );
  }

  if (!budgetData) return null;

  const { summary, pieChartData, dayWiseBreakdown = [], stopBreakdown = [], overbudgetDays = [], budgetItems } = budgetData;

  const budgetUsagePercent = Math.min(
    100,
    Math.round((summary.grandTotal / (summary.threshold || 1)) * 100)
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to={`/itinerary/${tripId}`}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Itinerary Builder
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-emerald-600" />
            Trip Financial Analytics & Budget
          </h1>
          <p className="text-sm text-slate-500">
            {summary.tripName} • {summary.durationDays} Days Total Duration
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowItemModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Expense / Booking
          </button>
        </div>
      </div>

      {/* Over-Budget Alert Banner */}
      {summary.isOverBudget && (
        <div className="p-5 rounded-3xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 shadow-sm animate-fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-2xl bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-base">Trip Exceeds Target Budget Limit!</p>
              <p className="text-xs text-amber-800/90 mt-0.5 max-w-2xl">
                Estimated total <strong>${summary.grandTotal.toLocaleString()}</strong> exceeds your set target threshold of <strong>${summary.threshold.toLocaleString()}</strong> by <strong>${(summary.grandTotal - summary.threshold).toLocaleString()}</strong>. Consider optimizing activities or accommodation stays.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('DAILY')}
            className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors shrink-0 shadow-sm"
          >
            Review Overbudget Days ({overbudgetDays.length})
          </button>
        </div>
      )}

      {/* Key Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Estimated Cost */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Est. Cost</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">$</div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">${summary.grandTotal.toLocaleString()}</p>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                summary.isOverBudget ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
            ></div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {budgetUsagePercent}% of ${summary.threshold.toLocaleString()} target limit
          </p>
        </div>

        {/* Daily Average Cost */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Avg Cost Per Day</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-blue-600">
            ${summary.dailyAverage.toLocaleString()}
            <span className="text-xs text-slate-400 font-normal ml-1">/ day</span>
          </p>
          <p className="text-[11px] text-slate-500">Across {summary.durationDays} itinerary days</p>
        </div>

        {/* Daily Budget Target */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Daily Target Limit</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-purple-600">
            ${Math.round(summary.threshold / summary.durationDays).toLocaleString()}
            <span className="text-xs text-slate-400 font-normal ml-1">/ day</span>
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <span>Threshold: ${summary.threshold.toLocaleString()}</span>
          </div>
        </div>

        {/* Overbudget Alerts Count */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Overbudget Alerts</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                overbudgetDays.length > 0
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {overbudgetDays.length > 0 ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
            </div>
          </div>
          <p
            className={`text-3xl font-extrabold ${
              overbudgetDays.length > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {overbudgetDays.length}{' '}
            <span className="text-xs text-slate-400 font-normal">
              {overbudgetDays.length === 1 ? 'day flagged' : 'days flagged'}
            </span>
          </p>
          <p className="text-[11px] text-slate-500">
            {overbudgetDays.length > 0 ? 'Daily spend exceeds target threshold' : 'All days within spending target'}
          </p>
        </div>
      </div>

      {/* Category Cost Breakdown Cards (Transport, Stay, Activities, Meals, Other) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900">Cost Breakdown by Category</h3>
          <span className="text-xs text-slate-500 font-medium">Estimated & Logged Allocations</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {/* Transport */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-purple-600">
              <Plane className="w-4 h-4" />
              <span className="text-xs font-bold">Transport</span>
            </div>
            <p className="text-lg font-extrabold text-slate-900">
              ${(summary.categoryTotals.Transport || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">
              {Math.round(((summary.categoryTotals.Transport || 0) / (summary.grandTotal || 1)) * 100)}% of total
            </p>
          </div>

          {/* Stay */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-blue-600">
              <BedDouble className="w-4 h-4" />
              <span className="text-xs font-bold">Stay / Hotel</span>
            </div>
            <p className="text-lg font-extrabold text-slate-900">
              ${(summary.categoryTotals.Stay || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">
              {Math.round(((summary.categoryTotals.Stay || 0) / (summary.grandTotal || 1)) * 100)}% of total
            </p>
          </div>

          {/* Activities */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-sky-600">
              <Mountain className="w-4 h-4" />
              <span className="text-xs font-bold">Activities</span>
            </div>
            <p className="text-lg font-extrabold text-slate-900">
              ${(summary.categoryTotals.Activities || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">
              {Math.round(((summary.categoryTotals.Activities || 0) / (summary.grandTotal || 1)) * 100)}% of total
            </p>
          </div>

          {/* Food / Meals */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-amber-600">
              <Utensils className="w-4 h-4" />
              <span className="text-xs font-bold">Meals & Dining</span>
            </div>
            <p className="text-lg font-extrabold text-slate-900">
              ${(summary.categoryTotals.Food || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">
              {Math.round(((summary.categoryTotals.Food || 0) / (summary.grandTotal || 1)) * 100)}% of total
            </p>
          </div>

          {/* Other */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-bold">Other / Misc</span>
            </div>
            <p className="text-lg font-extrabold text-slate-900">
              ${(summary.categoryTotals.Other || 0).toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-400">
              {Math.round(((summary.categoryTotals.Other || 0) / (summary.grandTotal || 1)) * 100)}% of total
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'OVERVIEW'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PieIcon className="w-3.5 h-3.5 inline mr-1.5" /> Visual Charts & Analytics
        </button>

        <button
          onClick={() => setActiveTab('DAILY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeTab === 'DAILY'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 inline mr-1.5" /> Day-by-Day Breakdown
          {overbudgetDays.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {overbudgetDays.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('ITEMS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ITEMS'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 inline mr-1.5" /> Logged Bookings & Receipts ({budgetItems.length})
        </button>
      </div>

      {/* TAB 1: VISUAL CHARTS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8 animate-fade-in">
          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Pie Chart */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <PieIcon className="w-5 h-5 text-blue-600" />
                  <span>Category Spending Breakdown</span>
                </div>
                <span className="text-xs font-bold text-slate-400">Total: ${summary.grandTotal.toLocaleString()}</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || CATEGORY_COLORS[entry.name] || '#3b82f6'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Cost']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                {pieChartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color || CATEGORY_COLORS[item.name] || '#3b82f6' }}
                      ></span>
                      <span className="text-slate-600 font-medium truncate">{item.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-900 ml-1">${item.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stop-by-Stop Bar Chart */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                  <BarChart2 className="w-5 h-5 text-emerald-600" />
                  <span>Cost Distribution by Destination Stop</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{stopBreakdown.length} destinations</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stopBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="city" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    />
                    <Legend />
                    <Bar dataKey="stayCost" name="Stay & Hotels ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="activitiesCost" name="Activities ($)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="foodCost" name="Meals ($)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="pt-2 text-xs text-slate-500 text-center">
                Visual comparison of accommodation, sightseeing, and dining expenses across each destination city.
              </div>
            </div>

          </div>

          {/* Target Budget Slider & Adjuster */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" /> Adjust Target Trip Budget Threshold
                </h4>
                <p className="text-xs text-slate-500">
                  Set your maximum desired budget to evaluate daily spending allowances and trigger overbudget warnings.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Current Threshold:</span>
                <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                  ${summary.threshold.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="5000"
                max="100000"
                step="2500"
                value={customThreshold || summary.threshold}
                onChange={(e) => setCustomThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-medium">
              <span>Budget: $5,000</span>
              <span>Moderate: $35,000</span>
              <span>Luxury: $1,00,000+</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DAY-BY-DAY BREAKDOWN & OVERBUDGET ALERTS */}
      {activeTab === 'DAILY' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Overbudget Highlights Banner */}
          {overbudgetDays.length > 0 && (
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h4 className="font-extrabold text-sm">
                  {overbudgetDays.length} {overbudgetDays.length === 1 ? 'Day Exceeds' : 'Days Exceed'} Target Daily Spending (${Math.round(summary.threshold / summary.durationDays).toLocaleString()}/day)
                </h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {overbudgetDays.map((d) => (
                  <div key={d.dayNumber} className="p-3 bg-white rounded-2xl border border-amber-200 shadow-sm text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-900">Day {d.dayNumber} ({d.city})</span>
                      <span className="text-amber-600">${d.totalCost.toLocaleString()}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Activities: ${d.activitiesCost} • Stay: ${d.stayCost}
                    </p>
                    {d.activitiesList.length > 0 && (
                      <p className="text-[10px] text-slate-400 truncate">
                        {d.activitiesList.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Expense Chart */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Day-by-Day Itinerary Expenditure Trend</span>
              </div>
              <span className="text-xs font-bold text-slate-500">Target Line: ${Math.round(summary.threshold / summary.durationDays)} / day</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayWiseBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="dayNumber" stroke="#64748b" fontSize={12} tickFormatter={(d) => `Day ${d}`} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    labelFormatter={(label) => `Day ${label}`}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  />
                  <Legend />
                  <Bar dataKey="stayCost" name="Stay ($)" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="activitiesCost" name="Activities ($)" stackId="a" fill="#0ea5e9" />
                  <Bar dataKey="foodCost" name="Meals ($)" stackId="a" fill="#f59e0b" />
                  <Bar dataKey="transportCost" name="Transport ($)" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Day by Day Table */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">Detailed Daily Schedule Cost Breakdown</h3>
              <span className="text-xs text-slate-400">{dayWiseBreakdown.length} total days</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-5">Day & Date</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Stay</th>
                    <th className="py-3 px-4">Activities</th>
                    <th className="py-3 px-4">Meals</th>
                    <th className="py-3 px-4">Daily Total</th>
                    <th className="py-3 px-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dayWiseBreakdown.map((day) => (
                    <tr key={day.dayNumber} className={`hover:bg-slate-50/60 transition-colors ${day.isOverbudget ? 'bg-amber-50/20' : ''}`}>
                      <td className="py-3.5 px-5 font-bold text-slate-900">
                        Day {day.dayNumber}
                        <span className="block text-[11px] font-normal text-slate-400">
                          {new Date(day.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{day.city}</td>
                      <td className="py-3.5 px-4 text-slate-600">${day.stayCost}</td>
                      <td className="py-3.5 px-4 text-blue-600 font-semibold">
                        ${day.activitiesCost}
                        {day.activitiesList.length > 0 && (
                          <span className="block text-[10px] font-normal text-slate-400 truncate max-w-[140px]">
                            {day.activitiesList[0]}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">${day.foodCost}</td>
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">${day.totalCost.toLocaleString()}</td>
                      <td className="py-3.5 px-5 text-right">
                        {day.isOverbudget ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-extrabold text-[10px] border border-amber-200 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Overbudget
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> On Track
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: LOGGED EXPENSES & RECEIPTS */}
      {activeTab === 'ITEMS' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Logged Expense & Booking Items</h3>
              <p className="text-xs text-slate-500">
                Track custom flight tickets, train passes, hotel deposits, or prepaid tour receipts.
              </p>
            </div>
            <button
              onClick={() => setShowItemModal(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-1.5 self-start"
            >
              <Plus className="w-3.5 h-3.5" /> Log New Expense
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            {['ALL', 'Transport', 'Stay', 'Activity', 'Food', 'Other'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedCategoryFilter.toLowerCase() === cat.toLowerCase()
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'ALL' ? 'All Bookings' : cat}
              </button>
            ))}
          </div>

          {filteredBudgetItems.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
              <DollarSign className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">No custom expense items in this category</p>
              <button
                onClick={() => setShowItemModal(true)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                + Log Flight, Hotel or Ticket Expense
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Item Name / Receipt</th>
                    <th className="py-3 px-4">Est. Cost</th>
                    <th className="py-3 px-4">Actual Cost</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredBudgetItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 font-bold text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 text-slate-600">${item.estimated_cost.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">
                        {item.actual_cost !== null && item.actual_cost !== undefined
                          ? `$${item.actual_cost.toLocaleString()}`
                          : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] truncate max-w-xs">
                        {item.notes || '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete expense"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Budget Item */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-emerald-600" /> Log Expense / Booking
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBudgetItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 text-sm rounded-xl bg-white text-slate-800 border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="Transport">Transport (Flight / Train / Cab)</option>
                  <option value="Stay">Stay (Hotel / Resort / Airbnb)</option>
                  <option value="Activity">Activity / Tour / Entry Pass</option>
                  <option value="Food">Meals / Dining / Food Tour</option>
                  <option value="Other">Other / Visa / Shopping</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Item Name / Description *
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Return Flight Ticket, Hotel Booking Deposit"
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Est. Cost ($) *
                  </label>
                  <input
                    type="number"
                    value={estimatedCost}
                    onChange={(e) => setEstimatedCost(e.target.value)}
                    placeholder="4500"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    Actual Cost ($)
                  </label>
                  <input
                    type="number"
                    value={actualCost}
                    onChange={(e) => setActualCost(e.target.value)}
                    placeholder="4200"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Non-refundable booking via MakeMyTrip"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/20"
                >
                  Save Booking Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};



