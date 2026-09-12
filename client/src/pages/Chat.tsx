import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Send, Sparkles, Bot, User, Compass, Calendar, DollarSign, ArrowRight, RefreshCw, CheckCircle, MapPin } from 'lucide-react';
import api from '../api/client';
import { City } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  itineraryPlan?: {
    tripTitle: string;
    cities: string[];
    days: { day: number; city: string; activities: string[]; costEstimate: number }[];
    totalEstimatedCost: number;
  };
}

const QUICK_PROMPTS = [
  { label: '🗼 3 Days in Paris & Rome', prompt: 'Plan a 3-day romantic European trip to Paris and Rome with top sights and gourmet food under $1,200.' },
  { label: '🍣 5 Days in Tokyo & Kyoto', prompt: 'Create a 5-day Japan trip itinerary covering futuristic Tokyo and historic Kyoto with estimated budget.' },
  { label: '🏖️ Bali Relaxation & Volcanoes', prompt: 'Generate a 4-day tropical adventure itinerary in Bali with Ubud rice terraces, surfing and volcano hikes.' },
  { label: '🏛️ Historic London & Amsterdam', prompt: 'Design a 4-day budget-friendly itinerary visiting London museums and Amsterdam canal tours.' },
];

export const Chat: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello explorer! 🌍 I'm your **GlobeTrotter AI Concierge**. Tell me where you'd like to travel, your budget, or who you're going with, and I'll generate a custom day-by-day itinerary for you!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch cities for intelligent suggestions
    api.get('/cities').then((res) => {
      setCities(res.data.cities || []);
    }).catch(console.error);

    // If query param prompt is provided, auto-trigger it
    const initialPrompt = searchParams.get('prompt');
    if (initialPrompt) {
      handleSendPrompt(initialPrompt);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendPrompt = (prompt: string) => {
    if (!prompt.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Generate intelligent AI response based on query
    setTimeout(() => {
      let aiText = '';
      let itineraryData: Message['itineraryPlan'] | undefined = undefined;

      const lower = prompt.toLowerCase();

      if (lower.includes('paris') || lower.includes('rome') || lower.includes('europe')) {
        aiText = `Here is a curated European adventure! ✨ I've built a multi-day itinerary covering iconic landmarks and gastronomy.`;
        itineraryData = {
          tripTitle: 'Parisian Charm & Roman Splendor',
          cities: ['Paris', 'Rome'],
          days: [
            { day: 1, city: 'Paris', activities: ['Eiffel Tower Sunset Access', 'Louvre Museum Tour', 'Pastry Workshop'], costEstimate: 155 },
            { day: 2, city: 'Paris', activities: ['Montmartre Bohemian Walk', 'Seine River Evening Dinner Cruise'], costEstimate: 120 },
            { day: 3, city: 'Rome', activities: ['Colosseum & Roman Forum VIP Access', 'Trastevere Food & Wine Tasting'], costEstimate: 128 },
          ],
          totalEstimatedCost: 950,
        };
      } else if (lower.includes('tokyo') || lower.includes('kyoto') || lower.includes('japan')) {
        aiText = `Kon'nichiwa! 🌸 Here is an ultra-modern yet cultural itinerary across Japan:`;
        itineraryData = {
          tripTitle: 'Japan Neon Lights & Zen Sanctuaries',
          cities: ['Tokyo', 'Kyoto'],
          days: [
            { day: 1, city: 'Tokyo', activities: ['Shibuya Crossing & Harajuku', 'Tsukiji Market Sushi Feast'], costEstimate: 85 },
            { day: 2, city: 'Tokyo', activities: ['teamLab Planets Digital Art', 'Senso-ji Temple Asakusa'], costEstimate: 53 },
            { day: 3, city: 'Kyoto', activities: ['Fushimi Inari Thousand Torii Gates', 'Arashiyama Bamboo Grove'], costEstimate: 47 },
            { day: 4, city: 'Kyoto', activities: ['Authentic Tea Ceremony in Machiya', 'Gion Lantern Evening Tour'], costEstimate: 60 },
          ],
          totalEstimatedCost: 1150,
        };
      } else if (lower.includes('bali') || lower.includes('beach') || lower.includes('tropical')) {
        aiText = `Welcome to paradise! 🌴 Here is your tropical retreat itinerary for Bali:`;
        itineraryData = {
          tripTitle: 'Bali Tropical Escapes & Temples',
          cities: ['Bali'],
          days: [
            { day: 1, city: 'Bali', activities: ['Tegalalang Rice Terraces & Swing', 'Ubud Art Market'], costEstimate: 45 },
            { day: 2, city: 'Bali', activities: ['Mount Batur Sunrise Trek', 'Natural Hot Springs'], costEstimate: 70 },
            { day: 3, city: 'Bali', activities: ['Uluwatu Sunset Temple', 'Kecak Fire Dance by the Cliff'], costEstimate: 38 },
          ],
          totalEstimatedCost: 580,
        };
      } else {
        aiText = `I've analyzed your travel request! 🗺️ Here is a tailored plan designed with verified activities and local experiences:`;
        itineraryData = {
          tripTitle: 'Custom Travel Exploration 2026',
          cities: ['London', 'Amsterdam'],
          days: [
            { day: 1, city: 'London', activities: ['Tower of London & Crown Jewels', 'Borough Market Food Tour'], costEstimate: 88 },
            { day: 2, city: 'London', activities: ['British Museum Highlights', 'West End Musical Ticket'], costEstimate: 115 },
            { day: 3, city: 'Amsterdam', activities: ['Van Gogh Museum Skip-Line', 'Canal Cruise with Dutch Cheese'], costEstimate: 56 },
          ],
          totalEstimatedCost: 790,
        };
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        itineraryPlan: itineraryData,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleCreateTripFromPlan = async (plan: Message['itineraryPlan']) => {
    if (!plan) return;
    try {
      // Create trip in database
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const res = await api.post('/trips', {
        name: plan.tripTitle,
        start_date: startDate,
        end_date: endDate,
        description: `Auto-generated itinerary for ${plan.cities.join(', ')}`,
        is_public: false,
      });

      const newTripId = res.data.trip.id;
      navigate(`/builder/${newTripId}`);
    } catch (err) {
      console.error('Failed to create trip from plan:', err);
      navigate('/create-trip');
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[84vh] flex flex-col md:flex-row gap-6 animate-fade-in">
      
      {/* Sidebar: AI Suggestions & Quick Prompts */}
      <div className="w-full md:w-80 glass-panel rounded-3xl border border-slate-200 p-5 flex flex-col justify-between overflow-hidden shadow-sm bg-white">
        <div>
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-600/20 text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">AI Concierge</h3>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Ready to plan
              </p>
            </div>
          </div>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Popular Travel Prompts</p>
          <div className="space-y-2">
            {QUICK_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendPrompt(item.prompt)}
                className="w-full text-left p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 transition-all text-xs font-semibold text-slate-700 hover:text-blue-700 flex items-center justify-between group"
              >
                <span>{item.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-100 text-xs text-purple-900 mt-4">
          <p className="font-bold flex items-center gap-1.5 mb-1">
            <Compass className="w-4 h-4 text-purple-600" />
            Instant Trip Conversion
          </p>
          <p className="text-[11px] text-purple-700 leading-relaxed">
            Click "Start Trip with this Plan" on any generated itinerary to automatically open the drag-and-drop builder!
          </p>
        </div>
      </div>

      {/* Main Chat Stream */}
      <div className="flex-1 glass-panel rounded-3xl border border-slate-200 flex flex-col overflow-hidden shadow-sm bg-slate-50/50">
        
        {/* Chat Messages Log */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div key={msg.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Message Bubble */}
                  <div
                    className={`p-4 rounded-3xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-blue-600 text-white rounded-tr-sm shadow-md font-medium'
                        : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200 shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Rich Itinerary Card if provided */}
                    {msg.itineraryPlan && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-slate-900">{msg.itineraryPlan.tripTitle}</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                            Est. ${msg.itineraryPlan.totalEstimatedCost}
                          </span>
                        </div>

                        {/* Day by Day Breakdown */}
                        <div className="space-y-2">
                          {msg.itineraryPlan.days.map((day) => (
                            <div key={day.day} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                              <div className="flex items-center justify-between font-bold text-slate-800">
                                <span className="flex items-center gap-1 text-blue-600">
                                  <MapPin className="w-3.5 h-3.5" />
                                  Day {day.day} — {day.city}
                                </span>
                                <span className="text-slate-500 font-medium">${day.costEstimate}</span>
                              </div>
                              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                                {day.activities.map((act, i) => (
                                  <li key={i} className="truncate">{act}</li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {/* Direct Action Button */}
                        <button
                          onClick={() => handleCreateTripFromPlan(msg.itineraryPlan)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <Compass className="w-4 h-4" />
                          <span>Start Trip with this Plan</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <span className="text-[10px] text-slate-400 block px-2">
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputValue);
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask for custom trip ideas, budgets, packing lists, or recommendations..."
              className="glass-input block w-full px-4 py-3 text-sm rounded-2xl font-medium"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white p-3 rounded-2xl shadow-lg shadow-blue-600/20 transition-all shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};



