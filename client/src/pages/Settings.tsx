import React from 'react';
import { Search } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Top Search (from mockup) */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Search..." 
          className="glass-input block w-full pl-11 pr-4 py-3 text-sm rounded-xl"
        />
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl border border-slate-200 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Account Settings / Help Screen</h1>
        </div>

        <form className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">First Name</label>
            <input type="text" placeholder="John" className="glass-input block w-full px-4 py-3 text-sm rounded-xl" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Last Name</label>
            <input type="text" placeholder="Doe" className="glass-input block w-full px-4 py-3 text-sm rounded-xl" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Email Id</label>
            <input type="email" placeholder="john.doe@example.com" className="glass-input block w-full px-4 py-3 text-sm rounded-xl" />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-600 mb-1.5">Password</label>
            <input type="password" placeholder="••••••••" className="glass-input block w-full px-4 py-3 text-sm rounded-xl" />
          </div>

          <div className="pt-4">
            <button type="button" className="w-full bg-gradient-to-r from-brand-600 to-sky-500 hover:from-brand-500 hover:to-sky-400 text-slate-900 font-bold text-sm px-5 py-3.5 rounded-xl shadow-lg transition-all">
              Update Settings
            </button>
          </div>
        </form>
      </div>

      <div className="text-center">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">App Version 1.0</p>
      </div>

    </div>
  );
};



