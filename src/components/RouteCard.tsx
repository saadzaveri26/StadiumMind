import * as React from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

export interface RouteCardProps {
  steps: string[];
  estTime: string;
  destinationName: string;
  onClose?: () => void;
}

export function RouteCard({ steps, estTime, destinationName, onClose }: RouteCardProps) {
  return (
    <Card className="bg-[#1A1C1E] border border-outline-variant p-4 shadow-2xl relative overflow-hidden pointer-events-auto">
      {/* Decorative vertical line accent */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-tertiary" />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-surface-container p-2.5 rounded-full flex-shrink-0 text-tertiary">
            {/* Render inline svg icon for route */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75h15m-15 5.625h15m-15 5.625h15M3 12h.008v.008H3V12Zm0-5.625h.008v.008H3V6.375Zm0 11.25h.008v.008H3v-.008Z" />
            </svg>
          </div>
          <div>
            <h4 className="font-label-bold text-label-bold text-on-surface">
              Route suggestion to {destinationName}
            </h4>
            <p className="font-body-md text-[13px] text-on-surface-variant leading-snug">
              Estimated duration: {estTime}
            </p>
          </div>
        </div>
        {onClose && (
          <Button
            aria-label="Dismiss route"
            variant="icon"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 min-w-8 h-8 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </Button>
        )}
      </div>

      <div className="space-y-3 pl-3 border-l border-outline-variant/50 ml-5 my-4">
        {steps.map((step, index) => (
          <div key={index} className="relative flex items-start gap-3">
            <span className="absolute -left-[27px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-surface-container-highest border border-outline-variant text-[11px] font-bold text-tertiary">
              {index + 1}
            </span>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              {step}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button variant="default" className="flex-1 min-h-[48px] h-touch-target-min">
          Start navigation
        </Button>
      </div>
    </Card>
  );
}
