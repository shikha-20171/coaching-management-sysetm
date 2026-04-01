import { Navigate } from "react-router-dom";
import { getDefaultRouteForRole } from "../utils/session";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) return <Navigate to="/" />;

  const allowedRoles = Array.isArray(role) ? role : role ? [role] : [];

  if (allowedRoles.length && !allowedRoles.includes(userRole)) {
    return <Navigate to={getDefaultRouteForRole(userRole)} replace />;
  }

  return children;
}
