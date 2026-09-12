import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Mail, Lock, AlertCircle, ArrowRight, Sparkles, ShieldCheck, Globe, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'user' | 'admin') => {
    const demoEmail = role === 'admin' ? 'admin@globetrotter.com' : 'alex@globetrotter.com';
    setEmail(demoEmail);
    setPassword('password123');
    try {
      setLoading(true);
      await login(demoEmail, 'password123');
      navigate(role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError('Demo login failed. Please ensure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden text-slate-100">
      {/* Dynamic Background Glows */}
      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-[450px] h-[450px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Left Side: Visual Hero Showcase */}
        <div className="lg:col-span-6 p-8 sm:p-12 bg-gradient-to-br from-slate-900 via-blue-950/80 to-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider mb-6">
              <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" />
              <span>GlobeTrotter 2.0</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              The Intelligent Multi-City Travel Planner.
            </h1>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed">
              Design comprehensive international itineraries, map out daily activities, balance travel budgets, and explore curated destination guides.
            </p>
          </div>

          {/* Social Proof Badges */}
          <div className="relative z-10 space-y-3 pt-8">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3 text-xs text-slate-300">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div>
                <p className="font-bold text-white">16 Worldwide Top Destinations</p>
                <p className="text-[11px] text-slate-400">Paris, Tokyo, Rome, NYC, Bali & more</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3 text-xs text-slate-300">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">AI-Powered Travel Concierge</p>
                <p className="text-[11px] text-slate-400">Generate complete schedules in seconds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-6 p-8 sm:p-12 bg-white text-slate-900 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Sign in to your account</h2>
              <p className="text-xs text-slate-500 mt-1">Access your saved itineraries, budget trackers & custom routes</p>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-rose-700 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@globetrotter.com"
                    className="glass-input block w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="glass-input block w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all transform active:scale-95 disabled:opacity-50 mt-2"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Instant Demo Access Buttons */}
            <div className="mt-6 pt-6 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                1-Click Instant Demo Login
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('user')}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  Demo Explorer
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="py-2.5 px-3 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Admin Demo
                </button>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            New to GlobeTrotter?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-500 font-bold ml-1">
              Create an account
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};



