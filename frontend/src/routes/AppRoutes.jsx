import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

const EnhancedHomePage = lazy(() => import('../components/EnhancedHomePage'));
const Login = lazy(() => import('../pages/Login'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const Explore = lazy(() => import('../pages/Explore'));
const VirtualTour = lazy(() => import('../pages/VirtualTour'));
const Itinerary = lazy(() => import('../pages/Itinerary'));
const Alerts = lazy(() => import('../pages/Alerts'));
const Festivals = lazy(() => import('../pages/Festivals'));
const Guides = lazy(() => import('../pages/Guides'));
const Places = lazy(() => import('../pages/Places'));
const Planner = lazy(() => import('../pages/Planner'));
const BudgetPlanner = lazy(() => import('../pages/BudgetPlanner'));
const BudgetSummary = lazy(() => import('../pages/BudgetSummary'));
const UserProfile = lazy(() => import('../pages/UserProfile'));
const CurrencyConverter = lazy(() => import('../pages/CurrencyConverter'));
const Profile = lazy(() => import('../pages/Profile'));
const ExploreRegion = lazy(() => import('../pages/ExploreRegion'));
const RegionDetail = lazy(() => import('../pages/RegionDetail'));
const PlaceDetail = lazy(() => import('../pages/PlaceDetail'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard'));
const TravelSocialFeed = lazy(() => import('../components/TravelSocialFeed'));
const ResultsDashboard = lazy(() => import('../pages/ResultsDashboard'));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

const AppRoutes = () => (
  <Suspense fallback={<div className="page-loading" style={{ padding: 24 }}>Loading…</div>}>
  <ScrollToTop />
  <Routes>
    <Route path="/" element={<EnhancedHomePage />} />
    <Route path="/login" element={<Login />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />
    <Route path="/explore" element={<Explore />} />
    <Route path="/virtual-tour" element={<VirtualTour />} />
    <Route path="/itinerary" element={<Itinerary />} />
    <Route path="/alerts" element={<Alerts />} />
    <Route path="/festivals" element={<Festivals />} />
    <Route path="/guides" element={<Guides />} />
    <Route path="/places" element={<Places />} />
    <Route path="/places/:id" element={<PlaceDetail />} />
    <Route path="/planner" element={<Planner />} />
    <Route path="/budget-planner" element={<BudgetPlanner />} />
    <Route path="/budget" element={<Navigate to="/budget-planner" replace />} />
    <Route path="/planner/:id/summary" element={<BudgetSummary />} />
    <Route path="/connect" element={<TravelSocialFeed />} />
    <Route path="/travel-buddy" element={<TravelSocialFeed />} />
    <Route path="/connect/:id" element={<UserProfile />} />
    <Route path="/currency" element={<CurrencyConverter />} />
    <Route path="/currency-converter" element={<CurrencyConverter />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/results" element={<ResultsDashboard />} />
    <Route path="/explore/:regionId" element={<ExploreRegion />} />
    <Route path="/explore/:regionId" element={<RegionDetail />} />
  </Routes>
  </Suspense>
);

export default AppRoutes;