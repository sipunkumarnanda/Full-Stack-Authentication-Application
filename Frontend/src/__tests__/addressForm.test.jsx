import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";

import Dashboard from "../pages/Dashboard";
import { AuthContext } from "../context/AuthContext";
import authService from "../services/authService";

describe("Address Management Form Validation", () => {
  const mockUser = {
    id: "usr_address_test",
    username: "sipun_test",
    email: "sipun@example.com",
    fullName: { firstName: "Sipun", lastName: "Nanda" },
    role: "user",
    isEmailVerified: true,
  };

  const mockContext = {
    user: mockUser,
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(authService, "getUserAddresses").mockResolvedValue({
      success: true,
      addresses: [],
    });
    vi.spyOn(authService, "addUserAddress").mockResolvedValue({
      success: true,
      message: "Address saved successfully!",
      addresses: [],
    });
    vi.spyOn(authService, "updateUserAddress").mockResolvedValue({
      success: true,
      message: "Address updated successfully!",
      addresses: [],
    });
  });

  it("restricts pincode input to numeric digits and blocks letters", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContext}>
          <Dashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Open Add Address Modal
    const addBtn = await screen.findByRole("button", { name: /add new address/i });
    await user.click(addBtn);

    const pincodeInput = screen.getByLabelText(/pincode/i);
    // Attempt typing letters 'dsdssds' as seen in the screenshot
    await user.type(pincodeInput, "dsdssds");
    // Verify letters are stripped out immediately
    expect(pincodeInput.value).toBe("");

    // Typing digits works up to max 6 digits
    await user.type(pincodeInput, "75700188");
    expect(pincodeInput.value).toBe("757001");
  });

  it("restricts phone input to digits and caps at 10 digits", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContext}>
          <Dashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const addBtn = await screen.findByRole("button", { name: /add new address/i });
    await user.click(addBtn);

    const phoneInput = screen.getByLabelText(/contact phone number/i);
    // Attempt typing letters
    await user.type(phoneInput, "sdsdsdsds");
    expect(phoneInput.value).toBe("");

    // Typing digits
    await user.type(phoneInput, "987654321099");
    expect(phoneInput.value).toBe("9876543210");
  });

  it("disables save button until all fields satisfy valid constraints", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContext}>
          <Dashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const addBtn = await screen.findByRole("button", { name: /add new address/i });
    await user.click(addBtn);

    const saveBtn = screen.getByRole("button", { name: /save address/i });
    // Initially disabled
    expect(saveBtn).toBeDisabled();

    // Fill valid street
    await user.type(screen.getByLabelText(/street address/i), "Main Road");
    expect(saveBtn).toBeDisabled();

    // Fill valid city & state
    await user.type(screen.getByLabelText(/city/i), "Rairangpur");
    await user.type(screen.getByLabelText(/state \/ province/i), "Odisha");
    expect(saveBtn).toBeDisabled();

    // Fill incomplete pincode (5 digits)
    await user.type(screen.getByLabelText(/pincode/i), "75700");
    expect(saveBtn).toBeDisabled();

    // Complete pincode to 6 digits
    await user.type(screen.getByLabelText(/pincode/i), "1");

    // Fill country
    await user.type(screen.getByLabelText(/country/i), "India");
    expect(saveBtn).toBeDisabled();

    // Fill valid 10-digit phone starting with 9
    await user.type(screen.getByLabelText(/contact phone number/i), "9876543210");

    // Now all fields are valid -> save button becomes enabled
    expect(saveBtn).toBeEnabled();

    // Submit and verify JSON numbers are dispatched in payload
    await user.click(saveBtn);

    await waitFor(() => {
      expect(authService.addUserAddress).toHaveBeenCalledWith({
        street: "Main Road",
        city: "Rairangpur",
        state: "Odisha",
        pincode: 757001,
        country: "India",
        phone: 9876543210,
        isDefault: false,
      });
    });
  });

  it("shows edit controls on every address and updates the selected address", async () => {
    const user = userEvent.setup();
    const savedAddresses = [
      {
        _id: "address_one",
        street: "Baripada",
        city: "Baripada",
        state: "Odisha",
        pincode: 757050,
        country: "India",
        phone: 9668187490,
        isDefault: false,
      },
      {
        _id: "address_two",
        street: "Rairangpur",
        city: "Rairangpur",
        state: "Odisha",
        pincode: 757050,
        country: "India",
        phone: 9668187490,
        isDefault: true,
      },
    ];
    authService.getUserAddresses.mockResolvedValue({
      success: true,
      addresses: savedAddresses,
    });

    render(
      <MemoryRouter>
        <AuthContext.Provider value={mockContext}>
          <Dashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const editButtons = await screen.findAllByRole("button", { name: /edit address/i });
    expect(editButtons).toHaveLength(2);

    await user.click(editButtons[1]);
    expect(screen.getByRole("heading", { name: /edit address/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/street address/i)).toHaveValue("Rairangpur");

    const streetInput = screen.getByLabelText(/street address/i);
    await user.clear(streetInput);
    await user.type(streetInput, "Rairangpur Main Road");
    await user.click(screen.getByRole("button", { name: /update address/i }));

    await waitFor(() => {
      expect(authService.updateUserAddress).toHaveBeenCalledWith("address_two", {
        street: "Rairangpur Main Road",
        city: "Rairangpur",
        state: "Odisha",
        pincode: 757050,
        country: "India",
        phone: 9668187490,
        isDefault: true,
      });
    });
  });
});
