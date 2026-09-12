import React, { useEffect, useState } from 'react';
import { ShieldAlert, Users, Calendar, MapPin, Activity as ActivityIcon, TrendingUp, Search } from 'lucide-react';
import api from '../api/client';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setData(res.data);
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="py-20 text-center text-slate-500 flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading Platform Analytics...</p>
      </div>
    );
  }

  const { stats, topCities, recentTrips } = data;

  return (
    <div className="space-y-8">
      
      {/* Search Bar Row */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search bar ......"
            className="glass-input block w-full pl-10 pr-4 py-2.5 text-sm rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <button className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-300">Group by</button>
          <button className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-300">Filter</button>
          <button className="text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-300">Sort by...</button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button className="text-xs font-semibold px-6 py-2 rounded-xl bg-slate-800 text-white border border-slate-700 whitespace-nowrap">Manage Users</button>
        <button className="text-xs font-semibold px-6 py-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-300 whitespace-nowrap">Popular cities</button>
        <button className="text-xs font-semibold px-6 py-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-300 whitespace-nowrap">Popular Activities</button>
        <button className="text-xs font-semibold px-6 py-2 rounded-xl bg-slate-100 text-slate-600 border border-slate-300 whitespace-nowrap">User Trends and Analytics</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Dashboard Area (Charts mockup) */}
        <div className="flex-[2] glass-panel p-8 rounded-[3rem] border border-slate-200 min-h-[500px] flex flex-col justify-center items-center gap-10 bg-slate-50/50">
           {/* Mock Pie Chart & List */}
           <div className="flex items-center gap-8 w-full justify-center">
             <div className="space-y-4">
               {[1,2,3,4].map(i => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-4 h-4 rounded-full bg-slate-400"></div>
                   <div className="w-24 h-4 rounded-full bg-slate-300"></div>
                 </div>
               ))}
             </div>
             <div className="w-32 h-32 rounded-full border-[12px] border-sky-400 border-t-emerald-400 border-r-emerald-400 transform rotate-45"></div>
           </div>

           {/* Mock Line Chart */}
           <div className="w-full max-w-md h-px bg-slate-300 relative mt-8">
             <div className="absolute top-0 left-0 w-full h-full flex justify-between items-end px-4">
                {[20, 10, 25, 40, 30].map((h, i) => (
                  <div key={i} className="relative w-full h-full flex justify-center items-end">
                    <div className="absolute bottom-0 w-px bg-slate-300" style={{ height: `${h}px` }}></div>
                    <div className="w-4 h-4 rounded-full bg-rose-500 z-10 relative" style={{ bottom: `${h - 8}px` }}></div>
                  </div>
                ))}
             </div>
           </div>

           {/* Mock Bar Chart & Lines */}
           <div className="flex items-end gap-8 w-full justify-center mt-8">
             <div className="flex items-end gap-2 h-24">
               <div className="w-6 h-12 bg-amber-400 rounded-t-sm"></div>
               <div className="w-6 h-16 bg-amber-400 rounded-t-sm"></div>
               <div className="w-6 h-24 bg-amber-400 rounded-t-sm"></div>
             </div>
             <div className="space-y-3 w-32 pb-4">
               <div className="w-full h-4 bg-slate-400"></div>
               <div className="w-full h-2 bg-slate-300"></div>
               <div className="w-full h-2 bg-slate-300"></div>
               <div className="w-full h-2 bg-slate-300"></div>
               <div className="w-full h-2 bg-slate-300"></div>
             </div>
           </div>
        </div>

        {/* Right Side Panel Description */}
        <div className="flex-1 glass-panel p-6 rounded-2xl border border-slate-200">
          <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
            <div>
              <p className="font-bold">Manage User section:</p>
              <p>This Section is responsible for the managing the users and their actions. This section will the admin the access to view all the trips made by the user. Also other functionalities are welcome....</p>
            </div>
            <div>
              <p className="font-bold">Popular cities:</p>
              <p>lists all the popular cities where the users are visiting based on the current user trends.</p>
            </div>
            <div>
              <p className="font-bold">Popular Activities:</p>
              <p>list all the popular activities that the users are doing based on the current user trend data.</p>
            </div>
            <div>
              <p className="font-bold">User trends and Analytics:</p>
              <p>This section will major focus on the providing analysis accross various points and give useful information to the user.</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};



