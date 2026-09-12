import React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

export const CalendarView: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
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

      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight text-center mb-8">Calendar View</h1>
      </div>

      {/* Calendar Mockup */}
      <div className="glass-panel max-w-3xl mx-auto rounded-3xl border border-slate-200 overflow-hidden bg-white">
        
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-6">
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft className="w-6 h-6 text-slate-600" /></button>
          <h2 className="text-xl font-bold text-slate-900">January 2024</h2>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronRight className="w-6 h-6 text-slate-600" /></button>
        </div>

        {/* Calendar Grid */}
        <div className="border-t border-slate-200">
          <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
            {['SUM', 'MON', 'MON', 'THI', 'WIL', 'THI', 'SHT', 'SUN'].map((day, i) => (
              <div key={i} className="py-3 text-center text-xs font-bold text-slate-600 border-r border-slate-200 last:border-0">{day}</div>
            ))}
          </div>
          
          {/* Week 1 */}
          <div className="grid grid-cols-8 border-b border-slate-200 min-h-[80px]">
            <div className="border-r border-slate-200 p-2"></div>
            <div className="border-r border-slate-200 p-2"></div>
            <div className="border-r border-slate-200 p-2"></div>
            <div className="border-r border-slate-200 p-2"></div>
            <div className="border-r border-slate-200 p-2"></div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">1</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">2</div>
            <div className="p-2 text-right text-sm text-slate-600">3</div>
          </div>
          
          {/* Week 2 */}
          <div className="grid grid-cols-8 border-b border-slate-200 min-h-[80px]">
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">5</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">4</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">5</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600 relative">
               <span>4</span>
               <div className="absolute top-8 left-1 right-1 bg-white border border-slate-300 text-[10px] font-bold text-center py-1">PARIS TRIP</div>
            </div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">5</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">7</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">8</div>
            <div className="p-2 text-right text-sm text-slate-600 bg-slate-300">9</div>
          </div>

          {/* Week 3 */}
          <div className="grid grid-cols-8 border-b border-slate-200 min-h-[80px]">
            <div className="border-r border-slate-200 p-2 text-left text-sm text-slate-600 relative">
              <span className="absolute top-2 right-2">9</span>
              <div className="absolute top-8 left-1 font-bold text-[10px]">5ARIS 10</div>
            </div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">11</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">9</div>
            <div className="border-r border-slate-200 p-2 text-left text-sm text-slate-600">15-22</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">12</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">14</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600 bg-slate-400 relative">
              <span className="absolute top-2 right-2">15</span>
              <div className="absolute bottom-2 left-1 right-1 font-bold text-xs text-center text-white truncate">NYC - GETAWAY</div>
            </div>
            <div className="p-2 text-right text-sm text-slate-600">16</div>
          </div>

          {/* Week 4 */}
          <div className="grid grid-cols-8 border-b border-slate-200 min-h-[80px]">
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600 relative">
              <span className="absolute top-2 right-2">16</span>
              <div className="absolute bottom-2 left-1 font-bold text-[10px]">JAPAN ADVENTURE</div>
            </div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">17</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600 bg-slate-300">18</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600 bg-slate-300">18</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600 bg-slate-300">20</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600 bg-slate-300">21</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">22</div>
            <div className="p-2 text-right text-sm text-slate-600">23</div>
          </div>
          
          {/* Week 5 */}
          <div className="grid grid-cols-8 border-b border-slate-200 min-h-[80px]">
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600 bg-slate-300">23</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600 bg-slate-300">25</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">26</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">26</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">27</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">28</div>
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600"></div>
            <div className="p-2 text-center text-sm text-slate-600 border border-slate-300 bg-white shadow-sm flex items-center justify-center font-bold">NYC GETAWAY</div>
          </div>
          
          {/* Week 6 */}
          <div className="grid grid-cols-8 min-h-[80px]">
            <div className="border-r border-slate-200 p-2 text-right text-sm text-slate-600">30</div>
            <div className="border-r border-slate-200 p-2"></div>
            <div className="border-r border-slate-200 p-2"></div>
            <div className="border-r border-slate-200 p-2"></div>
            <div className="border-r border-slate-200 p-2"></div>
            <div className="border-r border-slate-200 p-2"></div>
            <div className="border-r border-slate-200 p-2"></div>
            <div className="p-2"></div>
          </div>

        </div>
      </div>
    </div>
  );
};



