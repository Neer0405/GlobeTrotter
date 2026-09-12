export interface User {
  id: string;
  name: string;
  email: string;
  photo_url?: string;
  language_pref: string;
  role: 'USER' | 'ADMIN';
  saved_cities?: string;
}

export interface City {
  id: string;
  name: string;
  country: string;
  region?: string;
  cost_index: number;
  popularity_score: number;
  image_url: string;
  description?: string;
  activities?: Activity[];
  _count?: {
    activities: number;
  };
}

export interface Activity {
  id: string;
  city_id: string;
  city?: City;
  name: string;
  category: string;
  cost: number;
  duration_minutes: number;
  description?: string;
  image_url?: string;
}

export interface StopActivity {
  id: string;
  stop_id: string;
  activity_id: string;
  activity: Activity;
  scheduled_date?: string;
  scheduled_time?: string;
  cost_override?: number;
  notes?: string;
}

export interface Stop {
  id: string;
  trip_id: string;
  city_id: string;
  city: City;
  order_index: number;
  arrival_date: string;
  departure_date: string;
  stop_activities: StopActivity[];
}

export interface BudgetItem {
  id: string;
  trip_id: string;
  category: 'Transport' | 'Stay' | 'Activity' | 'Food' | 'Other';
  name: string;
  estimated_cost: number;
  actual_cost?: number | null;
  notes?: string | null;
}

export interface Trip {
  id: string;
  user_id: string;
  user?: {
    name: string;
    photo_url?: string;
  };
  name: string;
  start_date: string;
  end_date: string;
  description?: string;
  cover_photo_url?: string;
  is_public: boolean;
  stops: Stop[];
  budget_items?: BudgetItem[];
  stops_count?: number;
  total_cost?: number;
  created_at?: string;
}

export interface DayWiseExpense {
  dayNumber: number;
  date: string;
  city: string;
  activitiesCost: number;
  stayCost: number;
  foodCost: number;
  transportCost: number;
  totalCost: number;
  isOverbudget: boolean;
  activitiesList: string[];
}

export interface StopBreakdownItem {
  city: string;
  country: string;
  days: number;
  activitiesCost: number;
  stayCost: number;
  foodCost: number;
  totalCost: number;
}

export interface BudgetSummary {
  summary: {
    tripId: string;
    tripName: string;
    durationDays: number;
    grandTotal: number;
    dailyAverage: number;
    categoryTotals: {
      Transport: number;
      Stay: number;
      Activities: number;
      Food: number;
      Other: number;
      [key: string]: number;
    };
    isOverBudget: boolean;
    threshold: number;
    dailyTargetBudget?: number;
    overbudgetDaysCount?: number;
  };
  overbudgetDays?: DayWiseExpense[];
  pieChartData: Array<{ name: string; value: number; color?: string }>;
  dayWiseBreakdown?: DayWiseExpense[];
  stopBreakdown?: StopBreakdownItem[];
  dailyBreakdown?: Array<{ city: string; activitiesCost: number; stayCost: number }>;
  budgetItems: BudgetItem[];
}
