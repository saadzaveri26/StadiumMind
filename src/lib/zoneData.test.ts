import { getZoneColor, getZoneStatus } from "./zoneData";

describe("zoneData utilities - getZoneColor and getZoneStatus boundaries", () => {
  test("boundary at 0%", () => {
    expect(getZoneColor(0)).toBe("primary");
    expect(getZoneStatus(0)).toBe("NOMINAL");
  });

  test("boundary at 59%", () => {
    expect(getZoneColor(59)).toBe("primary");
    expect(getZoneStatus(59)).toBe("NOMINAL");
  });

  test("boundary at 60%", () => {
    expect(getZoneColor(60)).toBe("tertiary");
    expect(getZoneStatus(60)).toBe("WARNING");
  });

  test("boundary at 84%", () => {
    expect(getZoneColor(84)).toBe("tertiary");
    expect(getZoneStatus(84)).toBe("WARNING");
  });

  test("boundary at 85%", () => {
    expect(getZoneColor(85)).toBe("tertiary");
    expect(getZoneStatus(85)).toBe("WARNING");
  });

  test("boundary at 86%", () => {
    expect(getZoneColor(86)).toBe("error");
    expect(getZoneStatus(86)).toBe("CRITICAL");
  });

  test("boundary at 100%", () => {
    expect(getZoneColor(100)).toBe("error");
    expect(getZoneStatus(100)).toBe("CRITICAL");
  });
});
