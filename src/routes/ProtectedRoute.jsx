import { Navigate, Outlet, useLocation, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getHomeRoute } from "../utils/role-routes";

export function ProtectedRoute({ allowedRoles }) {
  const { currentUser, role, loading } = useAuth();
  const location = useLocation();
  const outletContext = useOutletContext();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-panel rounded-[28px] px-8 py-6 text-center">
          <p className="font-display text-2xl font-bold text-strong">Preparing secure session...</p>
          <p className="mt-2 text-sm text-muted">Checking authentication and dashboard access.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getHomeRoute(role)} replace />;
  }

  return <Outlet context={outletContext} />;
}
