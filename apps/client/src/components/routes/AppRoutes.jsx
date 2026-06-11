import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/routes/ProtectedRoutes";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import SwapForm from "@/pages/SwapForm";
import KYCForm from "@/pages/KYCForm";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute  />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/swap" element={<SwapForm />} />
        <Route path="/kyc" element={<KYCForm />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;