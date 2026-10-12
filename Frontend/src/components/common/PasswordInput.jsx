import React, { useState, forwardRef } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import Input from "./Input";

export const PasswordInput = forwardRef(
  ({ id, label = "Password", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <Input
        ref={ref}
        id={id}
        label={label}
        type={showPassword ? "text" : "password"}
        leftIcon={Lock}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            tabIndex={0}
            className="text-slate-400 hover:text-slate-600 focus:text-primary focus:outline-none transition-colors p-1 rounded"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Eye className="w-4 h-4" aria-hidden="true" />
            )}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
