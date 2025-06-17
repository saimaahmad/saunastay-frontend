import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { currentUser, authLoading } = useContext(AuthContext);

  if (authLoading) return <div>Loading...</div>;

  return currentUser ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
