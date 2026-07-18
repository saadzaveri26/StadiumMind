import * as React from "react";

export interface SuggestionChipProps {
  label: string;
  iconName?: string;
  isActive?: boolean;
  onClick: () => void;
}

export function SuggestionChip({ label, iconName, isActive = false, onClick }: SuggestionChipProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-label-bold whitespace-nowrap active:scale-95 transition-all duration-200 cursor-pointer ${
        isActive
          ? "border-tertiary/50 bg-tertiary/10 text-tertiary hover:bg-tertiary/20"
          : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-variant hover:text-on-surface hover:border-tertiary/30"
      }`}
    >
      {iconName && (
        <span className="material-symbols-outlined text-[16px] text-inherit">
          {iconName}
        </span>
      )}
      {label}
    </button>
  );
}
