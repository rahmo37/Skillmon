import React from "react";

// Accepts children (icon + text), color, and className
function GlassButton({ children, color = "sky", className = "", ...props }) {
  const colorStyles = {
    sky: {
      base: "text-sky-300 border-sky-400/40",
      bg: "bg-gradient-to-br from-sky-300/10 via-sky-400/10 to-white/5",
      hover: "hover:shadow-[0_0_18px_4px_rgba(56,189,248,0.22)]",
      focus: "focus:ring-sky-400/40",
    },
    emerald: {
      base: "text-emerald-200 border-emerald-400/30",
      bg: "bg-gradient-to-br from-emerald-400/10 via-emerald-300/10 to-white/5",
      hover: "hover:shadow-[0_0_18px_4px_rgba(16,185,129,0.18)]",
      focus: "focus:ring-emerald-400/40",
    },
    rose: {
      base: "text-rose-200 border-rose-400/40",
      bg: "bg-gradient-to-br from-rose-400/10 via-rose-200/10 to-white/5",
      hover: "hover:shadow-[0_0_18px_4px_rgba(244,63,94,0.19)]",
      focus: "focus:ring-rose-400/40",
    },
    amber: {
      base: "text-amber-200 border-amber-400/40",
      bg: "bg-gradient-to-br from-amber-400/10 via-amber-200/10 to-white/5",
      hover: "hover:shadow-[0_0_18px_4px_rgba(251,191,36,0.13)]",
      focus: "focus:ring-amber-400/40",
    },
    amber: {
      base: "text-amber-200 border-amber-400/40",
      bg: "bg-gradient-to-br from-amber-400/10 via-amber-200/10 to-white/5",
      hover: "hover:shadow-[0_0_18px_4px_rgba(251,191,36,0.13)]",
      focus: "focus:ring-amber-400/40",
    },
  };

  const styles = colorStyles[color] || colorStyles.sky;

  return (
    <button
      className={`
        relative flex items-center gap-2 px-6 py-2 rounded-xl font-semibold
        shadow-lg backdrop-blur-lg border text-base transition-all duration-300
        cursor-pointer select-none
        ${styles.base} ${styles.bg} ${styles.hover} ${styles.focus}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export default GlassButton;
