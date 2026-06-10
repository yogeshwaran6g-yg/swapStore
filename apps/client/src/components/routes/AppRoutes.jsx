import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/routes/ProtectedRoutes";
import Home from "@/pages/Home";
import SwapForm from "@/pages/SwapForm";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/swap" element={<SwapForm />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;