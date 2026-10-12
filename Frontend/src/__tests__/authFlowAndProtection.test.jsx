import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import ProtectedRoute from "../routes/ProtectedRoute";
import { AuthContext } from "../context/AuthContext";
import { formatApiError } from "../services/api";
import authService from "../services/authService";

describe("Auth Flow and Protected Routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authService, "getUserAddresses").mockResolvedValue({
      success: true,
      addresses: [],
    });
  });

  describe("API Error Message Formatting", () => {
    it("formats 429 response using Retry-After header", () => {
      const err = {
        response: {
          status: 429,
          headers: { "retry-after": "45" },
          data: { message: "Too many requests" },
        },
      };
      const formatted = formatApiError(err);
      expect(formatted.status).toBe(429);
      expect(formatted.message).toContain("45 seconds");
    });

    it("formats 401 response with default or backend message", () => {
      const err = {
        response: {
          status: 401,
          data: { message: "Invalid email or password" },
        },
      };
      const formatted = formatApiError(err);
      expect(formatted.status).toBe(401);
      expect(formatted.message).toBe("Invalid email or password");
    });

    it("handles network disconnect without response", () => {
      const err = new Error("Network Error");
      const formatted = formatApiError(err);
      expect(formatted.status).toBe(0);
      expect(formatted.message).toContain("Network error");
    });
  });

  describe("Failed Login Handling", () => {
    it("displays error message returned by backend and prevents navigation", async () => {
      const user = userEvent.setup();
      const mockLogin = vi.fn().mockRejectedValue({
        status: 401,
        message: "Invalid email or password",
      });

      const contextValue = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: mockLogin,
        logout: vi.fn(),
      };

      render(
        <MemoryRouter initialEntries={["/login"]}>
          <AuthContext.Provider value={contextValue}>
            <Login />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByPlaceholderText(/enter your password/i);
      const submitBtn = screen.getByRole("button", { name: /sign in/i });

      await user.type(emailInput, "test@example.com");
      await user.type(passwordInput, "WrongPassword123!");
      await user.click(submitBtn);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: "test@example.com",
          password: "WrongPassword123!",
        });
        expect(screen.getByRole("alert")).toHaveTextContent("Invalid email or password");
      });
    });
  });

  describe("Protected Route Redirects", () => {
    it("redirects unauthenticated user from protected dashboard to /login", () => {
      const unauthContext = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };

      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AuthContext.Provider value={unauthContext}>
            <Routes>
              <Route path="/login" element={<div>Login Page Target</div>} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<div>Secret Dashboard</div>} />
              </Route>
            </Routes>
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByText("Login Page Target")).toBeInTheDocument();
      expect(screen.queryByText("Secret Dashboard")).not.toBeInTheDocument();
    });

    it("allows authenticated user access to protected route", () => {
      const authContext = {
        user: {
          id: "usr_123",
          username: "janedoe",
          email: "jane@example.com",
          fullName: { firstName: "Jane", lastName: "Doe" },
          isEmailVerified: true,
          role: "user",
        },
        isAuthenticated: true,
        isLoading: false,
      };

      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AuthContext.Provider value={authContext}>
            <Routes>
              <Route path="/login" element={<div>Login Page Target</div>} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<div>Secret Dashboard</div>} />
              </Route>
            </Routes>
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByText("Secret Dashboard")).toBeInTheDocument();
    });
  });

  describe("Logout Behavior", () => {
    it("calls logout handler when clicking sign out in navbar", async () => {
      const user = userEvent.setup();
      const mockLogout = vi.fn().mockResolvedValue({});

      const authContext = {
        user: {
          id: "usr_123",
          username: "janedoe",
          email: "jane@example.com",
          fullName: { firstName: "Jane", lastName: "Doe" },
          isEmailVerified: true,
          role: "user",
        },
        isAuthenticated: true,
        isLoading: false,
        logout: mockLogout,
      };

      render(
        <MemoryRouter initialEntries={["/dashboard"]}>
          <AuthContext.Provider value={authContext}>
            <Dashboard />
          </AuthContext.Provider>
        </MemoryRouter>
      );

      await user.click(screen.getByRole("button", { name: /open account menu/i }));
      await user.click(screen.getByRole("menuitem", { name: /sign out/i }));

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });
});
