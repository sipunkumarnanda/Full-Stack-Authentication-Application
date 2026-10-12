import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";

import PasswordInput from "../components/common/PasswordInput";

describe("Password Visibility Toggle Tests", () => {
  it("renders with input type 'password' by default", () => {
    render(<PasswordInput id="pwd" label="Password" name="password" />);

    const input = screen.getByLabelText("Password", { selector: "input" });
    expect(input).toHaveAttribute("type", "password");

    const toggleBtn = screen.getByRole("button", { name: /show password/i });
    expect(toggleBtn).toBeInTheDocument();
  });

  it("toggles to type 'text' when clicking show password button", async () => {
    const user = userEvent.setup();
    render(<PasswordInput id="pwd" label="Password" name="password" />);

    const input = screen.getByLabelText("Password", { selector: "input" });
    const toggleBtn = screen.getByRole("button", { name: /show password/i });

    await user.click(toggleBtn);
    expect(input).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: /hide password/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /hide password/i }));
    expect(input).toHaveAttribute("type", "password");
  });
});
