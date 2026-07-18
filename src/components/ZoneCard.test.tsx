import * as React from "react";
import { render, screen } from "@testing-library/react";
import { ZoneCard } from "./ZoneCard";
import { Zone } from "@/lib/zoneData";

describe("ZoneCard Component", () => {
  const mockZone: Zone = {
    zoneId: "Z-101",
    name: "West Gate Entrance",
    gate: "Gate C",
    occupancyPercent: 45,
    capacity: 2000,
    status: "NOMINAL",
  };

  test("renders nominal zone information and color styles correctly", () => {
    render(<ZoneCard zone={mockZone} />);
    expect(screen.getByText("West Gate Entrance")).toBeInTheDocument();
    expect(screen.getByText("NOMINAL")).toBeInTheDocument();
    expect(screen.getByText("45% CAP")).toBeInTheDocument();

    const card = screen.getByTestId("zone-card-Z-101");
    // Nominal maps to primary color styles
    expect(card).toHaveClass("border-primary/30");
  });

  test("renders congested zone with critical style classes", () => {
    const congestedZone: Zone = {
      ...mockZone,
      occupancyPercent: 92,
      status: "CRITICAL",
    };
    render(<ZoneCard zone={congestedZone} />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    expect(screen.getByText("92% CAP")).toBeInTheDocument();

    const card = screen.getByTestId("zone-card-Z-101");
    // Critical maps to error styles
    expect(card).toHaveClass("border-error/50");
  });

  test("renders warning zone with moderate style classes", () => {
    const warningZone: Zone = {
      ...mockZone,
      occupancyPercent: 75,
      status: "WARNING",
    };
    render(<ZoneCard zone={warningZone} />);
    expect(screen.getByText("WARNING")).toBeInTheDocument();
    expect(screen.getByText("75% CAP")).toBeInTheDocument();

    const card = screen.getByTestId("zone-card-Z-101");
    // Warning maps to tertiary styles
    expect(card).toHaveClass("border-tertiary/30");
  });
});
