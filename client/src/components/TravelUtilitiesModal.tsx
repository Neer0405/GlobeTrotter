import React, { useState } from 'react';
import { X, CheckSquare, DollarSign, Users, Clock, Plus, Trash2, ArrowRightLeft, Sparkles, CheckCircle2 } from 'lucide-react';

interface TravelUtilitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'packing' | 'currency' | 'splitter' | 'timezone';
}

const DEFAULT_PACKING: Record<string, { category: string; items: string[] }[]> = {
  Urban: [
    { category: 'Essentials', items: ['Passport & Visa Copies', 'Credit Cards & Travel Cash', 'Power Bank & Adapters', 'Phone & Charger'] },
    { category: 'Clothing', items: ['Comfortable Walking Shoes', 'Smart Casual Outfits', 'Light Jacket / Cardigan', 'Sunglasses'] },
    { category: 'Toiletries & Health', items: ['Toothbrush & Paste', 'Sunscreen SPF 50+', 'Personal Medications', 'Hand Sanitizer'] },
  ],
  Beach: [
    { category: 'Essentials', items: ['Passport', 'Travel Insurance Card', 'Waterproof Phone Pouch', 'Snorkel Gear'] },
    { category: 'Clothing', items: ['Swimwear (x3)', 'Flip Flops / Water Shoes', 'UV Sun Shirt & Hats', 'Breathable Linen Outfits'] },
    { category: 'Toiletries & Care', items: ['Reef-Safe Sunscreen', 'After-Sun Aloe Vera Gel', 'Lip Balm with SPF', 'Insect Repellent'] },
  ],
  Winter: [
    { category: 'Essentials', items: ['Thermal Underlayers', 'Heavy Down Parka', 'Waterproof Snow Boots', 'Hand Warmers'] },
    { category: 'Accessories', items: ['Woolen Beanie & Scarf', 'Insulated Gloves', 'Polarized Snow Goggles', 'Moisturizing Cream'] },
  ],
};

const CURRENCY_RATES: Record<string, { symbol: string; rate: number; name: string }> = {
  USD: { symbol: '$', rate: 1.0, name: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, name: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, name: 'British Pound' },
  INR: { symbol: '$', rate: 83.5, name: 'Indian Rupee' },
  JPY: { symbol: '¥', rate: 155.2, name: 'Japanese Yen' },
  AUD: { symbol: 'A$', rate: 1.52, name: 'Australian Dollar' },
  CAD: { symbol: 'C$', rate: 1.36, name: 'Canadian Dollar' },
  SGD: { symbol: 'S$', rate: 1.35, name: 'Singapore Dollar' },
};

export const TravelUtilitiesModal: React.FC<TravelUtilitiesModalProps> = ({ isOpen, onClose, initialTab = 'packing' }) => {
  const [activeTab, setActiveTab] = useState<'packing' | 'currency' | 'splitter' | 'timezone'>(initialTab);

  // Packing state
  const [tripVibe, setTripVibe] = useState<'Urban' | 'Beach' | 'Winter'>('Urban');
  const [packedItems, setPackedItems] = useState<Record<string, boolean>>({});
  const [customItemText, setCustomItemText] = useState('');

  // Currency Converter state
  const [amount, setAmount] = useState<number>(100);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');

  // Expense Splitter state
  const [people, setPeople] = useState<string[]>(['You', 'Sam', 'Jordan']);
  const [newPerson, setNewPerson] = useState('');
  const [expenses, setExpenses] = useState<{ id: string; title: string; amount: number; paidBy: string }[]>([
    { id: '1', title: 'Hotel Booking', amount: 450, paidBy: 'You' },
    { id: '2', title: 'Dinner & Drinks', amount: 180, paidBy: 'Sam' },
    { id: '3', title: 'Car Rental & Fuel', amount: 210, paidBy: 'Jordan' },
  ]);
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState<number | ''>('');
  const [expensePaidBy, setExpensePaidBy] = useState('You');

  if (!isOpen) return null;

  // Toggle packed
  const togglePacked = (item: string) => {
    setPackedItems((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  // Convert Currency
  const convertedAmount =
    (amount / CURRENCY_RATES[fromCurrency].rate) * CURRENCY_RATES[toCurrency].rate;

  // Calculate split
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const perPersonShare = people.length > 0 ? totalExpense / people.length : 0;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;
    setExpenses([
      ...expenses,
      {
        id: Date.now().toString(),
        title: expenseTitle,
        amount: Number(expenseAmount),
        paidBy: expensePaidBy,
      },
    ]);
    setExpenseTitle('');
    setExpenseAmount('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Traveler's Utility Toolbox</h2>
              <p className="text-xs text-slate-300">Smart packing checklists, live currency exchange & bill splitter</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('packing')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'packing'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Packing Checklist
          </button>
          <button
            onClick={() => setActiveTab('currency')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'currency'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Currency Converter
          </button>
          <button
            onClick={() => setActiveTab('splitter')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'splitter'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Group Expense Splitter
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* 1. PACKING CHECKLIST TAB */}
          {activeTab === 'packing' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Trip Style & Environment</h3>
                  <p className="text-xs text-slate-500">Pick your trip style to generate targeted checklist items</p>
                </div>
                <div className="flex gap-2">
                  {(['Urban', 'Beach', 'Winter'] as const).map((style) => (
                    <button
                      key={style}
                      onClick={() => setTripVibe(style)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        tripVibe === style
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {style === 'Urban' ? '🏙️ City / Urban' : style === 'Beach' ? '🏖️ Tropical / Beach' : '❄️ Winter / Alpine'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Checklist Categories */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {DEFAULT_PACKING[tripVibe].map((cat) => (
                  <div key={cat.category} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                      <span>{cat.category}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        {cat.items.filter((i) => packedItems[i]).length}/{cat.items.length}
                      </span>
                    </h4>
                    <div className="space-y-2">
                      {cat.items.map((item) => {
                        const isChecked = !!packedItems[item];
                        return (
                          <label
                            key={item}
                            onClick={() => togglePacked(item)}
                            className={`flex items-center gap-2.5 p-2 rounded-xl text-xs cursor-pointer select-none transition-all ${
                              isChecked
                                ? 'bg-emerald-50 text-emerald-800 line-through opacity-75 font-medium'
                                : 'bg-white text-slate-700 hover:bg-blue-50/50 shadow-sm border border-slate-100'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 pointer-events-none"
                            />
                            <span className="truncate">{item}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. CURRENCY CONVERTER TAB */}
          {activeTab === 'currency' && (
            <div className="max-w-2xl mx-auto space-y-6 py-4">
              <div className="glass-panel p-6 rounded-3xl border border-slate-200 shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Amount</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                      className="glass-input block w-full px-4 py-3 text-lg font-bold rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">From Currency</label>
                    <select
                      value={fromCurrency}
                      onChange={(e) => setFromCurrency(e.target.value)}
                      className="glass-input block w-full px-4 py-3 text-sm font-semibold rounded-xl"
                    >
                      {Object.entries(CURRENCY_RATES).map(([code, details]) => (
                        <option key={code} value={code}>
                          {code} - {details.name} ({details.symbol})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Conversion result card */}
                <div className="my-6 p-6 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl text-center relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                  <p className="text-xs text-blue-200 font-semibold uppercase tracking-wider mb-1">Live Conversion Result</p>
                  <p className="text-3xl sm:text-4xl font-black tracking-tight">
                    {CURRENCY_RATES[toCurrency].symbol}
                    {convertedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-blue-100 mt-2">
                    1 {fromCurrency} = {(CURRENCY_RATES[toCurrency].rate / CURRENCY_RATES[fromCurrency].rate).toFixed(4)} {toCurrency}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">To Target Currency</label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="glass-input block w-full px-4 py-3 text-sm font-semibold rounded-xl"
                  >
                    {Object.entries(CURRENCY_RATES).map(([code, details]) => (
                      <option key={code} value={code}>
                        {code} - {details.name} ({details.symbol})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 3. GROUP EXPENSE SPLITTER TAB */}
          {activeTab === 'splitter' && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <span className="text-xs text-blue-700 font-semibold">Total Group Bill</span>
                  <p className="text-2xl font-black text-blue-950">${totalExpense.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <span className="text-xs text-emerald-700 font-semibold">Group Size</span>
                  <p className="text-2xl font-black text-emerald-950">{people.length} Travelers</p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <span className="text-xs text-amber-700 font-semibold">Cost Per Person</span>
                  <p className="text-2xl font-black text-amber-950">${perPersonShare.toFixed(2)}</p>
                </div>
              </div>

              {/* Add expense form */}
              <form onSubmit={handleAddExpense} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Expense Description</label>
                  <input
                    type="text"
                    value={expenseTitle}
                    onChange={(e) => setExpenseTitle(e.target.value)}
                    placeholder="e.g. Flight tickets, Museum pass"
                    className="glass-input block w-full px-3 py-2 text-xs rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0.00"
                    className="glass-input block w-full px-3 py-2 text-xs rounded-xl"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Paid By</label>
                  <select
                    value={expensePaidBy}
                    onChange={(e) => setExpensePaidBy(e.target.value)}
                    className="glass-input block w-full px-3 py-2 text-xs rounded-xl"
                  >
                    {people.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-4 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Expense
                  </button>
                </div>
              </form>

              {/* Expense List */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">Logged Expenses</h4>
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 shadow-sm text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{exp.title}</span>
                      <span className="text-slate-400 ml-2">(Paid by <strong className="text-slate-700">{exp.paidBy}</strong>)</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-slate-900">${exp.amount.toFixed(2)}</span>
                      <button
                        onClick={() => setExpenses(expenses.filter((e) => e.id !== exp.id))}
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};



