// frontend/src/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router";

export function ProtectedRoute({ authToken, children }) {
    if (!authToken) {
        return <Navigate to="/login" replace />;
    }
    return children;
}
