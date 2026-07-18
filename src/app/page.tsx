"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const STADIUMS = [
  { id: "metropolis", name: "Metropolis Arena", location: "Sector 4, Downtown" },
  { id: "lusail", name: "Lusail Stadium", location: "Zone 5, Al Daayen" },
  { id: "azteca", name: "Estadio Azteca", location: "Santa Ursula, Mexico City" },
  { id: "bcplace", name: "BC Place", location: "Robson St, Vancouver" },
];

export default function LandingPage() {
  const { language } = useLanguage();
  const t = translations[language] || translations.en!;
  
  const [selectedStadium, setSelectedStadium] = useState(STADIUMS[0]!);
  const [metrics, setMetrics] = useState({
    occupancy: 84,
    incidents: 2,
    gates: "All",
    status: "Nominal",
  });

  // Fetch real summary telemetry on mount
  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch("/api/zones/summary");
        if (res.ok) {
          const data = await res.json();
          setMetrics({
            occupancy: data.averageOccupancy || 84,
            incidents: data.criticalCount || 2,
            gates: t.allGates,
            status: data.criticalCount > 0 ? t.critical : t.nominal,
          });
        }
      } catch {
        // Fallback to static mock values
      }
    }
    fetchSummary();
  }, [t.allGates, t.critical, t.nominal]);

  return (
    <div className="flex-1 px-container-padding max-w-[1200px] mx-auto w-full flex flex-col gap-stack-gap md:gap-grid-gutter pt-8">
      {/* Welcome Section */}
      <section className="py-4">
        <h1 className="font-headline-lg-mobile text-2xl md:text-3xl text-on-surface font-extrabold tracking-tight">
          {t.welcome}
        </h1>
        <p className="font-body-md text-sm text-on-surface-variant mt-1">
          {t.subtitle}
        </p>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-grid-gutter">
        {/* Select Stadium Feature Card (Spans 8 cols on desktop) */}
        <div className="lg:col-span-8 relative rounded-xl overflow-hidden group border border-outline-variant/30 min-h-[240px] md:min-h-[320px] flex flex-col justify-end p-6 bg-surface-container-low shadow-lg">
          {/* Background overlay gradient */}
          <div className="absolute inset-0 bg-[#071f18] opacity-60 z-0" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-0" />
          
          {/* Card Content */}
          <div className="relative z-10 flex flex-col gap-2 w-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-data-mono text-xs text-tertiary uppercase tracking-widest">
                {t.activeVenue}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h3 className="font-headline-xl text-3xl font-extrabold text-on-surface">
                  {selectedStadium.name}
                </h3>
                <p className="font-body-md text-xs text-on-surface-variant mt-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>{" "}
                  {selectedStadium.location}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" className="flex items-center gap-2 h-[48px] self-start sm:self-auto">
                    {t.changeVenue} <span className="material-symbols-outlined text-[18px]">expand_more</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {STADIUMS.map((stadium) => (
                    <DropdownMenuItem
                      key={stadium.id}
                      onClick={() => setSelectedStadium(stadium)}
                      className={`cursor-pointer ${
                        selectedStadium.id === stadium.id ? "bg-primary-container text-primary" : ""
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm">{stadium.name}</div>
                        <div className="text-[10px] opacity-60">{stadium.location}</div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Navigation CTAs (Spans 4 cols on desktop) */}
        <div className="lg:col-span-4 grid grid-cols-1 gap-grid-gutter">
          {/* Navigate CTA */}
          <Link href="/navigate" className="block w-full">
            <button className="w-full h-full bg-tertiary text-on-tertiary rounded-xl p-6 flex flex-col items-start justify-between min-h-[150px] relative overflow-hidden group hover:scale-[1.02] transition-all duration-200 border border-transparent shadow-[0_0_15px_rgba(233,195,73,0.1)] cursor-pointer text-left">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10 group-hover:scale-110 transition-transform duration-500 text-on-tertiary">
                <span className="material-symbols-outlined text-[120px]">map</span>
              </div>
              <span className="material-symbols-outlined text-[40px] mb-4 relative z-10">map</span>
              <div className="relative z-10">
                <h4 className="font-headline-lg text-lg font-bold uppercase">{t.navigateTitle}</h4>
                <p className="font-label-bold text-xs opacity-80 mt-1">{t.navigateDesc}</p>
              </div>
            </button>
          </Link>

          {/* Ask Assistant CTA */}
          <Link href="/assistant" className="block w-full">
            <button className="w-full h-full bg-primary-container border border-tertiary/50 text-on-surface rounded-xl p-6 flex flex-col items-start justify-between min-h-[150px] relative overflow-hidden group hover:bg-[#0d4a38] transition-all duration-200 cursor-pointer text-left">
              <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-tertiary">
                <span className="material-symbols-outlined text-[120px]">chat_bubble</span>
              </div>
              <span className="material-symbols-outlined text-[40px] mb-4 text-tertiary relative z-10">chat_bubble</span>
              <div className="relative z-10">
                <h4 className="font-headline-lg text-lg font-bold text-tertiary uppercase">{t.assistantTitle}</h4>
                <p className="font-label-bold text-xs text-on-surface-variant mt-1">{t.assistantDesc}</p>
              </div>
            </button>
          </Link>
        </div>
      </div>

      {/* Live Metrics Mini-Dashboard */}
      <section className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-grid-gutter border-t border-outline-variant/30 pt-6">
        <div className="flex flex-col gap-1">
          <span className="font-data-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            {t.currentCap}
          </span>
          <span className="font-headline-lg text-2xl text-tertiary font-extrabold">
            {metrics.occupancy}%
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-data-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            {t.incidents}
          </span>
          <span className="font-headline-lg text-2xl text-error font-extrabold">
            {metrics.incidents}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-data-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            {t.gatesOpen}
          </span>
          <span className="font-headline-lg text-2xl text-primary font-extrabold">
            {metrics.gates}
          </span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-data-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
            {t.sysStatus}
          </span>
          <span className="font-headline-lg text-2xl text-primary font-extrabold">
            {metrics.status}
          </span>
        </div>
      </section>
    </div>
  );
}
