import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "../Layout";
import ProtectedRoute from "./ProtectedRoutes";
import Dashboard from "../../pages/Dashboard";
import ExchangeRates from "../../pages/ExchangeRates";
import SwapOrders from "../../pages/SwapOrders";
import Login from "../../pages/Login";

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
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default AppRoutes;