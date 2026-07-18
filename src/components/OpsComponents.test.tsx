import * as React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OpsZoneTable } from "./OpsZoneTable";
import { OpsAlertFeed } from "./OpsAlertFeed";
import { OpsIncidentForm } from "./OpsIncidentForm";
import { NavigateForm } from "./NavigateForm";
import { Zone } from "@/lib/zoneData";

const mockZones: Zone[] = [
  {
    zoneId: "Z-104",
    name: "Main Gate",
    gate: "Gate A",
    occupancyPercent: 72,
    capacity: 2000,
    status: "WARNING",
  },
];

describe("OpsZoneTable Component", () => {
  const mockTranslations = {
    zoneOccupancy: "Zone Occupancy Status",
    zoneId: "Zone ID",
    location: "Location",
    capacity: "Cap",
  };

  test("renders loading spinner when loading is true", () => {
    const { container } = render(<OpsZoneTable zones={[]} loading={true} translations={mockTranslations} />);
    // The spinner is an animate-spin indicator (w-6 h-6 rounded-full border-2 border-primary-container border-t-tertiary animate-spin)
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  test("renders zones table when loading is false", () => {
    render(<OpsZoneTable zones={mockZones} loading={false} translations={mockTranslations} />);
    expect(screen.getByText("Zone Occupancy Status")).toBeInTheDocument();
    expect(screen.getByText("Main Gate")).toBeInTheDocument();
    expect(screen.getByText("72%")).toBeInTheDocument();
  });
});

describe("OpsAlertFeed Component", () => {
  const mockTranslations = {
    aiAlerts: "AI Alerts Feed",
  };

  test("renders alerts list correctly", () => {
    const alerts = [
      {
        severity: "HIGH" as const,
        title: "Crowd Surge",
        message: "Abnormal density detected",
        zoneId: "Z-104",
        timestamp: "2M AGO",
      },
    ];

    render(<OpsAlertFeed alerts={alerts} translations={mockTranslations} />);
    expect(screen.getByText("AI Alerts Feed")).toBeInTheDocument();
    expect(screen.getByText(/Crowd Surge/i)).toBeInTheDocument();
    expect(screen.getByText(/Z-104/)).toBeInTheDocument();
    expect(screen.getByText("Abnormal density detected")).toBeInTheDocument();
  });
});

describe("OpsIncidentForm Component", () => {
  test("triggers onSubmit with form values", async () => {
    const onSubmit = jest.fn().mockResolvedValue({});
    const onCancel = jest.fn();

    render(<OpsIncidentForm zones={mockZones} onSubmit={onSubmit} onCancel={onCancel} />);

    fireEvent.change(screen.getByLabelText("Zone ID"), { target: { value: "Z-104" } });
    fireEvent.change(screen.getByPlaceholderText("Log details of operational incident..."), {
      target: { value: "Suspicious item found" },
    });
    fireEvent.click(screen.getByText("HIGH"));

    fireEvent.click(screen.getByText("Submit Incident"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("Z-104", "Suspicious item found", "HIGH");
    });
  });

  test("calls onCancel when cancel is clicked", () => {
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    render(<OpsIncidentForm zones={mockZones} onSubmit={onSubmit} onCancel={onCancel} />);
    fireEvent.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe("NavigateForm Component", () => {
  test("triggers onSubmit when Explore is clicked", () => {
    const onSubmit = jest.fn();
    const setStartZone = jest.fn();
    const setEndZone = jest.fn();
    const mockT = { findWay: "Find my way" };

    render(
      <NavigateForm
        zones={mockZones}
        startZone="Z-104"
        endZone="Z-305"
        setStartZone={setStartZone}
        setEndZone={setEndZone}
        onSubmit={onSubmit}
        calculating={false}
        errorMsg={null}
        translations={mockT}
      />
    );

    fireEvent.click(screen.getByText("Find my way"));
    expect(onSubmit).toHaveBeenCalled();
  });
});
