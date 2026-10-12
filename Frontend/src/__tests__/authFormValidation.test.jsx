import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

import Login from "../pages/Login";
import Register from "../pages/Register";
import { AuthContext } from "../context/AuthContext";

const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,
  login: vi.fn(),
  logout: vi.fn(),
  checkAuth: vi.fn(),
  updateUser: vi.fn(),
};

function renderWithProviders(ui) {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {ui}
      </AuthContext.Provider>
    </BrowserRouter>
  );
}

describe("Form Validation Tests", () => {
  describe("Login Form Validation", () => {
    it("displays validation errors when submitting empty form", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it("displays error for invalid email format", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Login />);

      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, "notanemail");

      const submitButton = screen.getByRole("button", { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
      });
    });
  });

  describe("Registration Form Validation", () => {
    it("validates required fields on register submit", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/you must agree to the terms/i)).toBeInTheDocument();
      });
    });

    it("validates password length under 8 characters", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const passwordInput = screen.getByPlaceholderText(/create a strong password/i);
      await user.type(passwordInput, "short");

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it("validates confirm password matching", async () => {
      const user = userEvent.setup();
      renderWithProviders(<Register />);

      const passwordInput = screen.getByPlaceholderText(/create a strong password/i);
      const confirmPasswordInput = screen.getByPlaceholderText(/re-enter your password/i);

      await user.type(passwordInput, "ValidPassword123!");
      await user.type(confirmPasswordInput, "DifferentPass123!");

      const submitButton = screen.getByRole("button", { name: /create account/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });
  });
});
