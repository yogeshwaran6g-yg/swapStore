import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

function ProtectedRoute({ redirectTo = "/" }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} replace />;
}

export default ProtectedRoute;