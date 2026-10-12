import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

import OtpInput from "../components/common/OtpInput";

function OtpWrapper({ onChange, length = 6 }) {
  const [val, setVal] = useState("");
  const handleChange = (newVal) => {
    setVal(newVal);
    if (onChange) onChange(newVal);
  };
  return <OtpInput length={length} value={val} onChange={handleChange} />;
}

describe("OTP Input Behavior Tests", () => {
  it("renders 6 input boxes with accessible labels", () => {
    render(<OtpWrapper />);
    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(6);
    expect(inputs[0]).toHaveAttribute("aria-label", "Digit 1 of 6");
    expect(inputs[5]).toHaveAttribute("aria-label", "Digit 6 of 6");
  });

  it("advances focus to the next input upon entering a digit", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<OtpWrapper onChange={handleChange} />);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "5");

    expect(handleChange).toHaveBeenCalledWith("5");
    expect(inputs[1]).toHaveFocus();
  });

  it("handles backspace to clear and move focus back", async () => {
    const user = userEvent.setup();
    render(<OtpWrapper />);

    const inputs = screen.getAllByRole("textbox");
    await user.type(inputs[0], "1");
    await user.type(inputs[1], "2");
    expect(inputs[2]).toHaveFocus();

    await user.keyboard("{Backspace}");
    expect(inputs[1]).toHaveFocus();
  });

  it("populates all boxes when pasting a complete 6-digit OTP", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<OtpWrapper onChange={handleChange} />);

    const inputs = screen.getAllByRole("textbox");
    await user.click(inputs[0]);
    await user.paste("654321");

    expect(handleChange).toHaveBeenCalledWith("654321");
  });
});
