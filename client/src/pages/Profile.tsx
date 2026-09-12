import React, { useEffect, useState } from 'react';
import { 
  User as UserIcon, Mail, Globe, Trash2, Save, MapPin, Check, 
  Settings, Heart, Calendar, ShieldAlert, Sparkles, Sliders, 
  Camera, Plus, ArrowRight, DollarSign, Edit3, Lock, Award, Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { City, Trip } from '../types';
import { TripCard } from '../components/TripCard';

export const Profile: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  // Active Tab: 'profile' | 'preferences' | 'trips' | 'saved'
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'trips' | 'saved'>('profile');

  // Form Fields
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photo_url || '');
  const [languagePref, setLanguagePref] = useState(user?.language_pref || 'en');
  const [currencyPref, setCurrencyPref] = useState('USD');
  const [travelStyle, setTravelStyle] = useState('Moderate');
  const [publicProfile, setPublicProfile] = useState(true);

  // Data
  const [trips, setTrips] = useState<Trip[]>([]);
  const [savedCities, setSavedCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sample avatars to pick easily
  const avatarPresets = [
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Alex'}`,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
  ];

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhotoUrl(user.photo_url || '');
      setLanguagePref(user.language_pref || 'en');
    }
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const [tripsRes, citiesRes] = await Promise.all([
        api.get('/trips'),
        api.get('/cities'),
      ]);

      const userTrips: Trip[] = tripsRes.data.trips || [];
      setTrips(userTrips);

      if (user?.saved_cities) {
        let cityIds: string[] = [];
        try {
          cityIds = JSON.parse(user.saved_cities);
        } catch {
          cityIds = user.saved_cities.split(',');
        }
        const allCities: City[] = citiesRes.data.cities || [];
        setSavedCities(allCities.filter((c) => cityIds.includes(c.id)));
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setSaving(true);
      const res = await api.put('/users/profile', {
        name,
        email,
        photo_url: photoUrl,
        language_pref: languagePref,
      });

      updateUser(res.data.user);
      setSuccessMsg('Profile and preferences updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTrip = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trip itinerary?')) return;
    try {
      await api.delete(`/trips/${id}`);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert('Failed to delete trip.');
    }
  };

  const handleUnsaveCity = async (cityId: string) => {
    try {
      await api.post('/users/saved-cities', { cityId });
      setSavedCities((prev) => prev.filter((c) => c.id !== cityId));
      if (user) {
        let currentIds: string[] = [];
        try {
          currentIds = JSON.parse(user.saved_cities || '[]');
        } catch {
          currentIds = (user.saved_cities || '').split(',');
        }
        const updated = currentIds.filter((id) => id !== cityId);
        updateUser({ ...user, saved_cities: JSON.stringify(updated) });
      }
    } catch (err) {
      alert('Failed to update wishlist.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('PERMANENT WARNING: Deleting your account will remove all your trip itineraries, budget logs, and saved data. Continue?')) return;

    try {
      await api.delete('/users/account');
      logout();
      navigate('/');
    } catch (err) {
      alert('Failed to delete account.');
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingTrips = trips.filter((t) => t.end_date >= todayStr);
  const previousTrips = trips.filter((t) => t.end_date < todayStr);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* 1. HERO PROFILE CARD */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row items-center gap-6 sm:gap-8 text-center md:text-left">
          <div className="relative group">
            <img
              src={photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || 'Alex'}`}
              alt={name}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-blue-400/30 shadow-2xl group-hover:scale-105 transition-transform"
            />
            <div className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-xl border border-blue-400 shadow-md">
              <Award className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{name || 'Travel Enthusiast'}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Verified Explorer
              </span>
            </div>
            <p className="text-sm text-slate-300 flex items-center justify-center md:justify-start gap-1.5 font-medium">
              <Mail className="w-4 h-4 text-blue-400" /> {email}
            </p>

            {/* Quick Stats */}
            <div className="pt-3 flex flex-wrap justify-center md:justify-start gap-4 sm:gap-6 border-t border-slate-800/80">
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Total Trips</span>
                <span className="text-lg font-black text-blue-400">{trips.length}</span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Saved Cities</span>
                <span className="text-lg font-black text-rose-400">{savedCities.length}</span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div>
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Currency</span>
                <span className="text-lg font-black text-emerald-400">$ (USD)</span>
              </div>
            </div>
          </div>

          <Link
            to="/create-trip"
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" /> Plan New Trip
          </Link>
        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 sm:gap-4 no-scrollbar">
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-5 py-3 font-bold text-xs rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <UserIcon className="w-4 h-4" /> Edit Profile
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-5 py-3 font-bold text-xs rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'preferences'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" /> Travel Preferences
        </button>

        <button
          onClick={() => setActiveTab('trips')}
          className={`px-5 py-3 font-bold text-xs rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'trips'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> My Trips ({trips.length})
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-5 py-3 font-bold text-xs rounded-2xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'saved'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500" /> Saved Destinations ({savedCities.length})
        </button>
      </div>

      {/* ALERT MESSAGES */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" /> {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="w-4 h-4 text-rose-600" /> {errorMsg}
        </div>
      )}

      {/* TAB CONTENT 1: EDIT PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Personal Details</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your name, email address, and avatar image.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Choose Profile Avatar
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {avatarPresets.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt={`Avatar preset ${idx}`}
                    onClick={() => setPhotoUrl(preset)}
                    className={`w-14 h-14 rounded-2xl object-cover cursor-pointer border-2 transition-all ${
                      photoUrl === preset ? 'border-blue-600 ring-4 ring-blue-100 scale-105' : 'border-slate-200 hover:border-blue-400'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="glass-input block w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="glass-input block w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Custom Photo Image URL (Optional)
              </label>
              <div className="relative">
                <Camera className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/your-photo.jpg"
                  className="glass-input block w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TAB CONTENT 2: PREFERENCES */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Travel & System Preferences</h2>
            <p className="text-xs text-slate-500 mt-0.5">Customize your preferred currency, language, and travel style.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Display Currency
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                  <select
                    value={currencyPref}
                    onChange={(e) => setCurrencyPref(e.target.value)}
                    className="glass-input block w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200"
                  >
                    <option value="USD">$ - USD (US Dollar)</option>
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">All budgets across GlobeTrotter are standard in USD ($).</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Interface Language
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-blue-500 absolute left-3.5 top-3.5" />
                  <select
                    value={languagePref}
                    onChange={(e) => setLanguagePref(e.target.value)}
                    className="glass-input block w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200"
                  >
                    <option value="en">English (US)</option>
                    <option value="gu">Gujarati (ગુજરાતી)</option>
                    <option value="hi">Hindi (हिंदी)</option>
                    <option value="es">Spanish (Español)</option>
                    <option value="fr">French (Français)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Default Travel Style
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="glass-input block w-full px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200"
                >
                  <option value="Moderate">Moderate Explorer (Balanced)</option>
                  <option value="Luxury">Luxury & Comfort</option>
                  <option value="Budget">Budget Conscious</option>
                  <option value="Backpacker">Backpacker & Adventure</option>
                </select>
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Privacy Settings
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={publicProfile}
                    onChange={(e) => setPublicProfile(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span className="text-xs font-semibold text-slate-700">Make my trip itineraries visible in Community</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-xs font-extrabold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>

          </form>
        </div>
      )}

      {/* TAB CONTENT 3: MY TRIPS */}
      {activeTab === 'trips' && (
        <div className="space-y-8">
          
          {/* Upcoming / Preplanned Trips */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" /> Preplanned & Active Trips ({upcomingTrips.length})
              </h2>
              <Link to="/create-trip" className="text-xs font-bold text-blue-600 hover:underline">
                + Add Trip
              </Link>
            </div>

            {upcomingTrips.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-200">
                <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No upcoming trips scheduled</p>
                <p className="text-xs text-slate-400 mt-0.5">Start building your next travel itinerary now.</p>
                <Link
                  to="/create-trip"
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" /> Plan a Trip
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
                ))}
              </div>
            )}
          </div>

          {/* Previous Trips */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" /> Previous Trips ({previousTrips.length})
            </h2>

            {previousTrips.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No past trips recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {previousTrips.map((trip) => (
                  <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrip} />
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB CONTENT 4: SAVED DESTINATIONS */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" /> Saved Destinations & Wishlist ({savedCities.length})
          </h2>

          {savedCities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
              <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Your wishlist is empty</p>
              <p className="text-xs text-slate-400 mt-0.5">Save cities from the Destinations page to view them here.</p>
              <Link
                to="/cities"
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Explore Destinations
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedCities.map((city) => (
                <div
                  key={city.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all group relative"
                >
                  <div className="h-44 overflow-hidden relative">
                    <img
                      src={city.image_url}
                      alt={city.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <button
                      onClick={() => handleUnsaveCity(city.id)}
                      className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full text-rose-500 transition-colors shadow-md"
                      title="Remove from Wishlist"
                    >
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-lg font-bold leading-tight">{city.name}</h3>
                      <p className="text-xs text-slate-300 font-medium">{city.country}</p>
                    </div>
                  </div>
                  <div className="p-4 flex items-center justify-between bg-slate-50/50 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-500">
                      Popularity: {city.popularity_score}/100
                    </span>
                    <Link
                      to={`/cities`}
                      className="text-xs font-extrabold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View City <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DANGER ZONE (DELETE ACCOUNT) */}
      <div className="bg-rose-50/50 rounded-3xl border border-rose-200/80 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-rose-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" /> Danger Zone
          </h3>
          <p className="text-xs text-rose-700 mt-0.5">
            Permanently delete your GlobeTrotter account and all associated itineraries.
          </p>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm shrink-0 flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete Account
        </button>
      </div>

    </div>
  );
};
