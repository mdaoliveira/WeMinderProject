// ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
export default function ProtectedRoute({ isAuth, children }) {
  return isAuth ? children : <Navigate to="/SignupAndLogin" replace />;
}