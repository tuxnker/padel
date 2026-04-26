import { describe, it, expect } from "vitest";
import { safeInternalPath } from "@/lib/safe-redirect";

describe("safeInternalPath", () => {
  it("returns the fallback when candidate is null/undefined/empty", () => {
    expect(safeInternalPath(null)).toBe("/courts");
    expect(safeInternalPath(undefined)).toBe("/courts");
    expect(safeInternalPath("")).toBe("/courts");
  });

  it("accepts a same-origin path", () => {
    expect(safeInternalPath("/profile")).toBe("/profile");
    expect(safeInternalPath("/play?create=true")).toBe("/play?create=true");
  });

  it("rejects protocol-relative URLs", () => {
    expect(safeInternalPath("//evil.com")).toBe("/courts");
  });

  it("rejects absolute URLs", () => {
    expect(safeInternalPath("https://evil.com")).toBe("/courts");
    expect(safeInternalPath("http://example.com/path")).toBe("/courts");
  });

  it("rejects backslash-prefixed paths", () => {
    expect(safeInternalPath("/\\evil.com")).toBe("/courts");
  });

  it("rejects paths that do not start with /", () => {
    expect(safeInternalPath("profile")).toBe("/courts");
  });

  it("respects a custom fallback", () => {
    expect(safeInternalPath(null, "/play")).toBe("/play");
    expect(safeInternalPath("//evil.com", "/play")).toBe("/play");
  });
});
