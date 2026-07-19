/** @jest-environment node */

import { GET as zonesSummaryGET } from "./zones/summary/route";
import { POST as updateZonePOST } from "./zones/update/route";
import { POST as navigateRoutePOST } from "./navigate/route/route";
import { POST as assistantChatPOST } from "./assistant/chat/route";
import { POST as incidentsLogPOST } from "./incidents/log/route";
import { POST as opsAlertsGeneratePOST } from "./ops/alerts/generate/route";

// Mock Firebase Admin SDK
jest.mock("@/lib/firebase-admin", () => {
  const mockDoc = {
    get: jest.fn().mockResolvedValue({ exists: true, data: () => ({ name: "North Concourse", gate: "Gate A", occupancyPercent: 80 }) }),
    set: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
  };
  const mockCollection = {
    doc: jest.fn().mockReturnValue(mockDoc),
    select: jest.fn().mockReturnThis(),
    get: jest.fn().mockResolvedValue([
      { id: "Z-104", data: () => ({ name: "Zone 1", gate: "Gate A", occupancyPercent: 40, status: "NOMINAL" }) }
    ]),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  };
  return {
    getAdminDb: jest.fn().mockResolvedValue({
      collection: jest.fn().mockReturnValue(mockCollection),
    }),
    getAdminAuth: jest.fn().mockResolvedValue({
      verifyIdToken: jest.fn().mockImplementation((token) => {
        if (token === "valid-staff-token") {
          return Promise.resolve({ staff: true, uid: "staff-1" });
        }
        if (token === "valid-nonstaff-token") {
          return Promise.resolve({ staff: false, uid: "user-1" });
        }
        return Promise.reject(new Error("Invalid Token"));
      }),
    }),
  };
});

// Mock Gemini Client
jest.mock("@/lib/gemini", () => ({
  getGeminiModel: jest.fn().mockReturnValue({
    generateContent: jest.fn().mockImplementation((prompt: string) => {
      if (prompt.includes("follow-up")) {
        return Promise.resolve({
          response: { text: () => '["Question 1", "Question 2", "Question 3"]' },
        });
      }
      if (prompt.includes("route")) {
        return Promise.resolve({
          response: { text: () => '{"steps":["Go left","Go right"],"estTime":"3m","destinationName":"Gate B"}' },
        });
      }
      return Promise.resolve({
        response: { text: () => "AI Response Content" },
      });
    }),
  }),
}));

describe("API Route Handlers", () => {
  // Test zones summary and cache-control headers
  test("GET /api/zones/summary returns aggregated data and cache control headers", async () => {
    const req = new Request("http://localhost/api/zones/summary", {
      method: "GET",
      headers: {
        "x-forwarded-for": "10.0.0.1",
      },
    });
    const res = await zonesSummaryGET(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.averageOccupancy).toBe(40);
    expect(json.zoneCount).toBe(1);
    expect(res.headers.get("Cache-Control")).toBe("s-maxage=10, stale-while-revalidate=30");
  });

  // Test zone updating validation
  test("POST /api/zones/update returns 400 on invalid payload", async () => {
    const req = new Request("http://localhost/api/zones/update", {
      method: "POST",
      headers: {
        "x-forwarded-for": "1.1.1.1",
      },
      body: JSON.stringify({ zoneId: "", occupancyPercent: 120 }), // invalid values
    });
    const res = await updateZonePOST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe("VALIDATION_ERROR");
  });

  // Test rate limiter trigger (sliding window)
  test("POST /api/zones/update returns 429 when rate limit exceeded", async () => {
    const req = new Request("http://localhost/api/zones/update", {
      method: "POST",
      headers: {
        "x-forwarded-for": "2.2.2.2",
      },
      body: JSON.stringify({ zoneId: "Z-101", occupancyPercent: 50 }),
    });

    // Exceed rate limit of 60 requests by calling it in a loop
    let lastRes: Response | null = null;
    for (let i = 0; i < 62; i++) {
      // Re-create the request so headers are parsed
      const loopReq = new Request("http://localhost/api/zones/update", {
        method: "POST",
        headers: {
          "x-forwarded-for": "2.2.2.2",
        },
        body: JSON.stringify({ zoneId: "Z-101", occupancyPercent: 50 }),
      });
      lastRes = await updateZonePOST(loopReq);
    }
    expect(lastRes?.status).toBe(429);
    const json = await lastRes?.json();
    expect(json.code).toBe("RATE_LIMIT_EXCEEDED");
  });

  // Test navigate input validation
  test("POST /api/navigate/route returns 400 on missing parameters", async () => {
    const req = new Request("http://localhost/api/navigate/route", {
      method: "POST",
      headers: {
        "x-forwarded-for": "3.3.3.3",
      },
      body: JSON.stringify({ startZoneId: "" }), // missing endZoneId
    });
    const res = await navigateRoutePOST(req);
    expect(res.status).toBe(400);
  });

  // Test chat validation
  test("POST /api/assistant/chat returns 400 on empty message", async () => {
    const req = new Request("http://localhost/api/assistant/chat", {
      method: "POST",
      headers: {
        "x-forwarded-for": "4.4.4.4",
      },
      body: JSON.stringify({ message: "", language: "en" }),
    });
    const res = await assistantChatPOST(req);
    expect(res.status).toBe(400);
  });

  // Test authentication for staff routes (incidents log)
  test("POST /api/incidents/log returns 401 when auth header is missing", async () => {
    const req = new Request("http://localhost/api/incidents/log", {
      method: "POST",
      headers: {
        "x-forwarded-for": "5.5.5.5",
      },
      body: JSON.stringify({ zoneId: "Z-104", description: "Water spill", severity: "LOW" }),
    });
    const res = await incidentsLogPOST(req);
    expect(res.status).toBe(401);
  });

  test("POST /api/incidents/log succeeds when user is not staff (relaxed check)", async () => {
    const req = new Request("http://localhost/api/incidents/log", {
      method: "POST",
      headers: {
        "x-forwarded-for": "6.6.6.6",
        Authorization: "Bearer valid-nonstaff-token",
      },
      body: JSON.stringify({ zoneId: "Z-104", description: "Water spill", severity: "LOW" }),
    });
    const res = await incidentsLogPOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  test("POST /api/incidents/log succeeds with valid staff credentials", async () => {
    const req = new Request("http://localhost/api/incidents/log", {
      method: "POST",
      headers: {
        "x-forwarded-for": "7.7.7.7",
        Authorization: "Bearer valid-staff-token",
      },
      body: JSON.stringify({ zoneId: "Z-104", description: "Water spill", severity: "LOW" }),
    });
    const res = await incidentsLogPOST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  // Test authentication for ops alerts generate
  test("POST /api/ops/alerts/generate returns 401 on missing auth", async () => {
    const req = new Request("http://localhost/api/ops/alerts/generate", {
      method: "POST",
      headers: {
        "x-forwarded-for": "8.8.8.8",
      },
    });
    const res = await opsAlertsGeneratePOST(req);
    expect(res.status).toBe(401);
  });
});
