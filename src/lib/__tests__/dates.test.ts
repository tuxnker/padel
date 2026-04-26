import { describe, it, expect } from "vitest";
import { dublinToday } from "@/lib/dates";

describe("dublinToday", () => {
  it("formats as YYYY-MM-DD", () => {
    expect(dublinToday(new Date("2026-04-25T12:00:00Z"))).toBe("2026-04-25");
  });

  it("rolls forward at 23:00 UTC during BST (00:00 Dublin on 25th)", () => {
    expect(dublinToday(new Date("2026-04-24T23:00:00Z"))).toBe("2026-04-25");
  });

  it("stays on prior day before midnight Dublin during BST", () => {
    expect(dublinToday(new Date("2026-04-24T22:30:00Z"))).toBe("2026-04-24");
  });

  it("uses UTC offset of +0 in winter (GMT)", () => {
    expect(dublinToday(new Date("2026-01-15T00:00:00Z"))).toBe("2026-01-15");
    expect(dublinToday(new Date("2026-01-14T23:30:00Z"))).toBe("2026-01-14");
  });
});
