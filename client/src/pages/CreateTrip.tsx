import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Calendar, Image as ImageIcon, Upload, Globe, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import api from '../api/client';

export const CreateTrip: React.FC = () => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [cities, setCities] = useState<any[]>([]);
  const [selectedCityId, setSelectedCityId] = useState('');

  useEffect(() => {
    api.get('/cities')
      .then(res => {
        setCities(res.data.cities);
        const defaultCity = res.data.cities.find((c: any) => c.name === 'New Delhi');
        if (defaultCity) {
          setSelectedCityId(defaultCity.id);
        }
      })
      .catch(console.error);
  }, []);

  const navigate = useNavigate();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('cover', file);

    try {
      setUploading(true);
      const res = await api.post('/trips/upload-cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setCoverUrl(res.data.url);
    } catch (err) {
      alert('Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !startDate || !endDate) {
      setError('Trip name, start date, and end date are required.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (startDate < todayStr) {
      setError('Start date cannot be in the past.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/trips', {
        name,
        start_date: startDate,
        end_date: endDate,
        description,
        cover_photo_url: coverUrl || undefined,
        is_public: isPublic,
      });

      const newTripId = res.data.trip.id;

      if (selectedCityId) {
        await api.post(`/trips/${newTripId}/stops`, {
          city_id: selectedCityId,
          arrival_date: startDate,
          departure_date: endDate,
        });
      }

      // Navigate directly to Itinerary Builder to add stops!
      navigate(`/builder/${newTripId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error creating trip.');
    } finally {
      setLoading(false);
    }
  };

  const sampleCovers = [
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&q=80',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  ];

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Plan a new Trip</h1>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label className="sm:w-1/4 text-xs font-semibold uppercase tracking-wider text-slate-600">Name of Trip</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="glass-input block w-full flex-1 px-4 py-3 text-sm rounded-xl"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label className="sm:w-1/4 text-xs font-semibold uppercase tracking-wider text-slate-600">Select a Place :</label>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="glass-input block w-full flex-1 px-4 py-3 text-sm rounded-xl bg-white text-slate-900 border border-slate-300"
            >
              <option value="">-- Choose a primary destination --</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.name}, {c.country}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label className="sm:w-1/4 text-xs font-semibold uppercase tracking-wider text-slate-600">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={today}
              className="glass-input block w-full flex-1 px-4 py-3 text-sm rounded-xl text-slate-900"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <label className="sm:w-1/4 text-xs font-semibold uppercase tracking-wider text-slate-600">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || today}
              className="glass-input block w-full flex-1 px-4 py-3 text-sm rounded-xl text-slate-900"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl border border-rose-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="pt-6 flex justify-end border-t border-slate-100 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Planning...'
              ) : (
                <>
                  Start Planning
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-4 pt-6">
        <h3 className="text-xl font-bold text-slate-900 tracking-wide border-b border-slate-200 pb-2">
          Suggestion for Places to Visit/Activities to perform
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {cities.slice(0, 6).map((city) => (
            <div key={city.id} className="h-40 rounded-2xl overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-sky-500/10 transition-all border border-slate-200/50">
              <img src={city.image_url} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-4">
                <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider mb-1">{city.country}</span>
                <h4 className="text-white font-bold text-sm leading-snug">{city.name}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};



