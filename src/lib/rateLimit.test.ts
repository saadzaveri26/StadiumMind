import { rateLimit } from "./rateLimit";

describe("rateLimit sliding window limiter", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("allows requests under the threshold", () => {
    const key = "test-client-1";
    const limitNum = 3;
    const windowMs = 1000;

    const res1 = rateLimit(key, limitNum, windowMs);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = rateLimit(key, limitNum, windowMs);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = rateLimit(key, limitNum, windowMs);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  test("blocks requests over the threshold", () => {
    const key = "test-client-2";
    const limitNum = 2;
    const windowMs = 1000;

    // 1st request
    rateLimit(key, limitNum, windowMs);
    // 2nd request
    rateLimit(key, limitNum, windowMs);
    // 3rd request (exceeded)
    const resBlocked = rateLimit(key, limitNum, windowMs);

    expect(resBlocked.success).toBe(false);
    expect(resBlocked.remaining).toBe(0);
  });

  test("resets after the window duration has elapsed", () => {
    const key = "test-client-3";
    const limitNum = 1;
    const windowMs = 1000;

    // 1st request allowed
    const res1 = rateLimit(key, limitNum, windowMs);
    expect(res1.success).toBe(true);

    // 2nd request blocked immediately
    const res2 = rateLimit(key, limitNum, windowMs);
    expect(res2.success).toBe(false);

    // Advance timers by windowMs + 1 ms
    jest.advanceTimersByTime(1001);

    // 3rd request allowed
    const res3 = rateLimit(key, limitNum, windowMs);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });
});
