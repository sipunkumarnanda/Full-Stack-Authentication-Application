import React from "react";
import { Loader2 } from "lucide-react";

export function Loader({ size = "md", text = "", className = "" }) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2
        className={`${sizeMap[size] || sizeMap.md} animate-spin text-primary`}
        aria-hidden="true"
      />
      {text && (
        <p className="text-sm font-medium text-slate-500 animate-pulse">
          {text}
        </p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default Loader;
