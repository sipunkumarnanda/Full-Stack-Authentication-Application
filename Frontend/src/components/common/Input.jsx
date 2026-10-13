import React, { forwardRef } from "react";
import { AlertCircle } from "lucide-react";

export const Input = forwardRef(
  (
    {
      id,
      label,
      type = "text",
      error,
      helperText,
      leftIcon: LeftIcon,
      rightSlot,
      className = "",
      inputClassName = "",
      required = false,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || props.name;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    return (
      <div className={`w-full ${className}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="form-label block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5"
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="input-shell relative rounded-xl">
          {LeftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <LeftIcon className="w-4 h-4" aria-hidden="true" />
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperId}
            className={`
              form-input w-full h-11 rounded-xl text-sm transition-all duration-200
              bg-white text-slate-900 border dark:bg-slate-800 dark:text-slate-50
              placeholder:text-slate-400 dark:placeholder:text-slate-500
              ${LeftIcon ? "pl-9" : "pl-3.5"}
              ${rightSlot ? "pr-10" : "pr-3.5"}
              ${
                error
                  ? "border-error focus:border-error focus:ring-1 focus:ring-error"
                  : "border-slate-300 hover:border-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:hover:border-slate-500"
              }
              focus:outline-none
              disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200 disabled:cursor-not-allowed
              ${inputClassName}
            `}
            {...props}
          />

          {rightSlot && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightSlot}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-xs text-error flex items-center gap-1 font-medium animate-fadeIn"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
