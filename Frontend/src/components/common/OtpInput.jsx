import React, { useRef, useEffect } from "react";

export function OtpInput({
  length = 6,
  value = "",
  onChange,
  disabled = false,
  error = "",
}) {
  const inputRefs = useRef([]);

  // Ensure digits array always has the exact length
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  useEffect(() => {
    // Auto-focus first input on mount if value is empty and not disabled
    if (!value && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [disabled, value]);

  const handleInputChange = (e, index) => {
    const rawVal = e.target.value;
    // Extract only digits
    const cleanDigit = rawVal.replace(/\D/g, "");

    if (!cleanDigit) {
      // Cleared or non-digit
      const newDigits = [...digits];
      newDigits[index] = "";
      onChange(newDigits.join(""));
      return;
    }

    // If more than one character was typed (e.g. autofill or rapid typing)
    if (cleanDigit.length > 1) {
      handlePasted(cleanDigit, index);
      return;
    }

    // Single digit input
    const newDigits = [...digits];
    newDigits[index] = cleanDigit[0];
    const newOtp = newDigits.join("");
    onChange(newOtp);

    // Auto-focus next input box
    if (index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        // Move to previous box and delete
        const newDigits = [...digits];
        newDigits[index - 1] = "";
        onChange(newDigits.join(""));
        inputRefs.current[index - 1]?.focus();
      } else {
        const newDigits = [...digits];
        newDigits[index] = "";
        onChange(newDigits.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePasted = (pastedText, startIndex = 0) => {
    const numericOnly = pastedText.replace(/\D/g, "").slice(0, length);
    if (!numericOnly) return;

    const newDigits = [...digits];
    for (let i = 0; i < numericOnly.length; i++) {
      if (startIndex + i < length) {
        newDigits[startIndex + i] = numericOnly[i];
      }
    }

    const newOtp = newDigits.join("");
    onChange(newOtp);

    // Focus either the end of pasted digits or the last box
    const nextFocusIndex = Math.min(startIndex + numericOnly.length, length - 1);
    inputRefs.current[nextFocusIndex]?.focus();
  };

  const handlePasteEvent = (e, index) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    handlePasted(pastedData, index);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center justify-center gap-2 sm:gap-3" role="group" aria-label="6-digit OTP code">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`Digit ${index + 1} of ${length}`}
            data-testid={`otp-input-${index}`}
            onChange={(e) => handleInputChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={(e) => handlePasteEvent(e, index)}
            className={`
              w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-lg border transition-all duration-150
              bg-white text-slate-900
              ${
                error
                  ? "border-error focus:border-error focus:ring-2 focus:ring-error/20"
                  : "border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
              }
              focus:outline-none
              disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed
            `}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-xs text-error font-medium text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default OtpInput;
