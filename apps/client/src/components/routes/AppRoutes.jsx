import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/routes/ProtectedRoutes";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import SwapForm from "@/pages/SwapForm";
import Profile from "@/pages/Profile";
import { LoanDashboard } from "@/components/loan/LoanDashboard";
import Layout from "@/components/Layout";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<Layout />} >      
        <Route path="/" element={<Home />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        {/* Protected routes */}
          <Route element={<ProtectedRoute  />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/swap" element={<SwapForm />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/loan" element={<LoanDashboard />} />
          </Route>
        </Route>
      </Routes>
  );
}

export default AppRoutes;