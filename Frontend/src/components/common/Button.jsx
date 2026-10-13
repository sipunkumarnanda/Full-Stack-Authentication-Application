import React, { forwardRef } from "react";
import { Loader2 } from "lucide-react";

export const Button = forwardRef(
  (
    {
      children,
      type = "button",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      fullWidth = false,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-primary text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary shadow-sm hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/20",
      secondary:
        "bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 focus:ring-slate-400",
      outline:
        "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus:ring-primary shadow-xs dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-700",
      danger:
        "bg-error text-white hover:bg-error-700 active:bg-red-800 focus:ring-error shadow-sm",
      ghost:
        "bg-transparent text-slate-600 hover:bg-slate-100 active:bg-slate-200 focus:ring-slate-300 dark:text-slate-300 dark:hover:bg-slate-800 dark:active:bg-slate-700",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2.5 gap-2 h-10",
      lg: "text-base px-5 py-3 gap-2.5 h-12",
    };

    const widthStyle = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={`app-button app-button-${variant} ${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            {LeftIcon && <LeftIcon className="w-4 h-4 shrink-0" aria-hidden="true" />}
            {children}
            {RightIcon && <RightIcon className="w-4 h-4 shrink-0" aria-hidden="true" />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
