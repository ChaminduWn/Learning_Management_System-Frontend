import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, roles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.user.role)) {
    // Redirect unauthorized users
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default PrivateRoute;
