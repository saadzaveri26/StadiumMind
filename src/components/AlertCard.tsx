import * as React from "react";
import { Card } from "./ui/card";

export interface AlertCardProps {
  severity: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  message: string;
  zoneId?: string;
  timestamp: string;
}

const AlertCardComponent = ({ severity, title, message, zoneId, timestamp }: AlertCardProps) => {
  const styles = {
    HIGH: {
      border: "border-l-4 border-l-error border-outline-variant/30",
      text: "text-error",
      bg: "bg-surface-container-high",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-error mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3Z" />
        </svg>
      ),
    },
    MEDIUM: {
      border: "border-l-4 border-l-tertiary border-outline-variant/30",
      text: "text-tertiary",
      bg: "bg-surface-container-high",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-tertiary mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      ),
    },
    LOW: {
      border: "border-l-4 border-l-primary border-outline-variant/30",
      text: "text-primary",
      bg: "bg-surface-container-high",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary mt-0.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.063.854l-.518.951a.5.5 0 00-.042.028l-.041.021a.75.75 0 00-.064.045l-.04.029a.75.75 0 11-1.063-.854l.518-.951a.5.5 0 00.042-.028l.041-.021a.75.75 0 00.064-.045l.04-.029ZM12 8.25h.007v.008H12V8.25Z" />
        </svg>
      ),
    },
  }[severity] || {
    border: "border-outline-variant/30",
    text: "text-on-surface",
    bg: "bg-surface-container-low",
    icon: null,
  };

  return (
    <Card className={`p-3 rounded-lg flex gap-3 ${styles.bg} ${styles.border}`}>
      {styles.icon}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-1">
          <span className={`font-label-bold text-label-bold text-xs uppercase tracking-wider ${styles.text}`}>
            {title} {zoneId ? `(${zoneId})` : ""}
          </span>
          <span className="font-data-mono text-data-mono text-on-surface-variant text-[10px]">
            {timestamp}
          </span>
        </div>
        <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
          {message}
        </p>
      </div>
    </Card>
  );
};

AlertCardComponent.displayName = "AlertCard";

export const AlertCard = React.memo(AlertCardComponent);
