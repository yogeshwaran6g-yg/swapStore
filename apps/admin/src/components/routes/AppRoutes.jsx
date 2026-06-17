import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../Layout";
import ProtectedRoute from "./ProtectedRoutes";
import Dashboard from "../../pages/Dashboard";
import ExchangeRates from "../../pages/ExchangeRates";
import SwapOrders from "../../pages/SwapOrders";
import Login from "../../pages/Login";
import KycManagement from "../../pages/KycManagement";
import LoanManagement from "../../pages/LoanManagement";
import UserManagement from "../../pages/UserManagement";
import UserDetails from "../../pages/UserDetails";
import SettingsManagement from "../../pages/SettingsManagement";
import CronManagement from "../../pages/CronManagement";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes wrapped in Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/rates" element={<ExchangeRates />} />
          <Route path="/swaps" element={<SwapOrders />} />
          <Route path="/kyc" element={<KycManagement />} />
          <Route path="/loans" element={<LoanManagement />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/users/:uid" element={<UserDetails />} />
          <Route path="/settings" element={<SettingsManagement />} />
          <Route path="/cron" element={<CronManagement />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;