import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import EditProfile from "./pages/EditProfile";
import NotFound from "./pages/NotFound";

function AppContent() {
  const { isDark } = useTheme();
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: isDark ? "#1E293B" : "#0F172A",
              color: "#F8FAFC",
              fontSize: "13px",
              borderRadius: "10px",
              padding: "12px 16px",
              boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.15)",
            },
            success: {
              iconTheme: {
                primary: "#16A34A",
                secondary: "#FFFFFF",
              },
            },
            error: {
              iconTheme: {
                primary: "#DC2626",
                secondary: "#FFFFFF",
              },
            },
          }}
        />

        <Routes>
          {/* Index Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public Auth Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard view="overview" />} />
            <Route path="/profile" element={<Dashboard view="profile" />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/addresses" element={<Dashboard view="addresses" />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
