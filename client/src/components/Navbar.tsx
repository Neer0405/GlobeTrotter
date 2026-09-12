import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, MapPin, Calendar, User as UserIcon, ShieldAlert, LogOut, Plus, Search, Sparkles, MessageSquare, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CommandSearchModal } from './CommandSearchModal';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) =>
    `px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
      isActive(path)
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const navLinks = [
    { path: '/dashboard', icon: Compass, label: 'Dashboard' },
    { path: '/my-trips', icon: Calendar, label: 'My Trips' },
    { path: '/cities', icon: MapPin, label: 'Destinations' },
    { path: '/activities', icon: Search, label: 'Activities' },
    { path: '/community', icon: UserIcon, label: 'Community' },
  ];

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform duration-200">
                <Compass className="w-5 h-5 text-white group-hover:rotate-45 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-700 bg-clip-text text-transparent leading-none">
                  GlobeTrotter
                </span>
                <span className="text-[9px] uppercase tracking-widest font-extrabold text-blue-600 mt-0.5 leading-none">
                  Travel Engine
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            {user ? (
              <div className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/80">
                {navLinks.map(({ path, icon: Icon, label }) => (
                  <Link key={path} to={path} className={navLinkClass(path)}>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span>{label}</span>
                  </Link>
                ))}
                {user.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      isActive('/admin')
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    <span>Admin</span>
                  </Link>
                )}
              </div>
            ) : null}

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 shrink-0">
              {user ? (
                <>
                  {/* Quick Search Button */}
                  <button
                    onClick={() => setSearchModalOpen(true)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-semibold shrink-0"
                    title="Quick Search (Ctrl+K)"
                  >
                    <Search className="w-4 h-4 shrink-0" />
                    <span className="hidden xl:inline text-slate-400 font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      Ctrl+K
                    </span>
                  </button>

                  {/* AI Planner CTA */}
                  <Link
                    to="/ai-planner"
                    className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border whitespace-nowrap ${
                      isActive('/ai-planner') 
                        ? 'bg-indigo-600 text-white shadow-indigo-600/20 border-indigo-600' 
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border-indigo-100'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>AI Planner</span>
                  </Link>

                  {/* Create Trip CTA */}
                  <Link
                    to="/create-trip"
                    className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-md shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 shrink-0" />
                    <span>Plan Trip</span>
                  </Link>

                  {/* Mobile menu toggle */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>

                  {/* User Profile Avatar Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 p-0.5 rounded-full border-2 border-slate-200 hover:border-blue-500 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                    >
                      <img
                        src={user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover bg-slate-100"
                      />
                    </button>

                    {dropdownOpen && (
                      <div
                        className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl py-2 border border-slate-200 z-50 animate-fade-in"
                        onMouseLeave={() => setDropdownOpen(false)}
                      >
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                          <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-blue-500" />
                          Profile & Preferences
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ShieldAlert className="w-4 h-4 text-blue-500" />
                          Account Settings
                        </Link>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            logout();
                            navigate('/login');
                          }}
                          className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-slate-700 hover:text-slate-900 px-4 py-2 text-xs font-bold transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Mobile Navigation Dropdown */}
          {mobileMenuOpen && user && (
            <div className="lg:hidden py-4 border-t border-slate-100 space-y-2 animate-fade-in">
              <div className="flex flex-col gap-1">
                {navLinks.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={navLinkClass(path)}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Global Modals */}
      <CommandSearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
    </>
  );
};



