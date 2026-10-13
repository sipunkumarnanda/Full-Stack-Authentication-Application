import React from "react";
import { ShieldCheck } from "lucide-react";
import EncryptedText from "./EncryptedText";

export function Loader({ size = "md", text = "", className = "" }) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <span className="loader-mark relative flex items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-xl bg-primary/25" />
        <ShieldCheck className={`${sizeMap[size] || sizeMap.md} relative m-2`} />
      </span>
      {text && (
        <p className="font-mono text-xs font-medium tracking-[0.12em] text-slate-500 dark:text-zinc-400">
          <EncryptedText text={text} encryptedClassName="text-primary/70" revealedClassName="text-slate-600 dark:text-zinc-300" />
        </p>
      )}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export default Loader;
