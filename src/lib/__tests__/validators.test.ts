import { describe, it, expect } from "vitest";
import { createPostSchema, updateProfileSchema } from "@/lib/validators";

const VALID_BASE = {
  playDate: "2026-04-25",
  playTime: "18:00",
  skillLevel: "any" as const,
  playersNeeded: 1,
};

describe("createPostSchema", () => {
  it("accepts a courtId only", () => {
    const result = createPostSchema.safeParse({
      ...VALID_BASE,
      courtId: "550e8400-e29b-41d4-a716-446655440000",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a courtNameOverride only", () => {
    const result = createPostSchema.safeParse({
      ...VALID_BASE,
      courtNameOverride: "My Garage Court",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when both venue fields are missing, on path ['court']", () => {
    const result = createPostSchema.safeParse(VALID_BASE);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["court"]);
    }
  });

  it("rejects malformed playDate", () => {
    const result = createPostSchema.safeParse({
      ...VALID_BASE,
      courtNameOverride: "X",
      playDate: "25/04/2026",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed playTime", () => {
    const result = createPostSchema.safeParse({
      ...VALID_BASE,
      courtNameOverride: "X",
      playTime: "6pm",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown skill level", () => {
    const result = createPostSchema.safeParse({
      ...VALID_BASE,
      courtNameOverride: "X",
      skillLevel: "elite",
    });
    expect(result.success).toBe(false);
  });

  it("rejects playersNeeded outside 1..3", () => {
    expect(
      createPostSchema.safeParse({
        ...VALID_BASE,
        courtNameOverride: "X",
        playersNeeded: 0,
      }).success,
    ).toBe(false);
    expect(
      createPostSchema.safeParse({
        ...VALID_BASE,
        courtNameOverride: "X",
        playersNeeded: 4,
      }).success,
    ).toBe(false);
  });

  it("rejects message > 500 chars", () => {
    const result = createPostSchema.safeParse({
      ...VALID_BASE,
      courtNameOverride: "X",
      message: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateProfileSchema", () => {
  it("accepts a minimal valid profile", () => {
    const result = updateProfileSchema.safeParse({
      name: "Maria",
      skillLevel: "intermediate",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = updateProfileSchema.safeParse({
      name: "",
      skillLevel: "beginner",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown skill level", () => {
    const result = updateProfileSchema.safeParse({
      name: "Maria",
      skillLevel: "any",
    });
    expect(result.success).toBe(false);
  });
});
