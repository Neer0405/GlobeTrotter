import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedLayout } from './components/ProtectedLayout';

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { MyTrips } from './pages/MyTrips';
import { CreateTrip } from './pages/CreateTrip';
import { ItineraryBuilder } from './pages/ItineraryBuilder';
import { ItineraryView } from './pages/ItineraryView';
import { CitySearch } from './pages/CitySearch';
import { AIPlanner } from './pages/AIPlanner';
import { ActivitySearch } from './pages/ActivitySearch';
import { TripBudget } from './pages/TripBudget';
import { SharedTrip } from './pages/SharedTrip';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/AdminDashboard';
import { Settings } from './pages/Settings';
import { Community } from './pages/Community';
import { Chat } from './pages/Chat';
import { CalendarView } from './pages/CalendarView';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/share/:tripId" element={<SharedTrip />} />

        {/* Authenticated Protected Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-trips" element={<MyTrips />} />
          <Route path="/create-trip" element={<CreateTrip />} />
          <Route path="/builder/:id" element={<ItineraryBuilder />} />
          <Route path="/itinerary/:id" element={<ItineraryView />} />
          <Route path="/cities" element={<CitySearch />} />
          <Route path="/ai-planner" element={<AIPlanner />} />
          <Route path="/activities" element={<ActivitySearch />} />
          <Route path="/budget/:id" element={<TripBudget />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/community" element={<Community />} />
          <Route path="/calendar" element={<CalendarView />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Catch All Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;



