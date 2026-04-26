import { describe, it, expect } from "vitest";
import {
  getInitials,
  formatPrice,
  formatPricePerHourOrNull,
  formatBookingMethod,
} from "@/lib/utils";

describe("getInitials", () => {
  it("takes first letter of each word, uppercased, max 2", () => {
    expect(getInitials("Maria O'Connor")).toBe("MO");
    expect(getInitials("john")).toBe("J");
    expect(getInitials("Anna Karenina Tolstoy")).toBe("AK");
  });
});

describe("formatPrice", () => {
  it("renders euro symbol with no decimals", () => {
    expect(formatPrice(15)).toBe("\u20AC15");
    expect(formatPrice(0)).toBe("\u20AC0");
  });

  it("returns N/A for null", () => {
    expect(formatPrice(null)).toBe("N/A");
  });
});

describe("formatPricePerHourOrNull", () => {
  it("appends /hr to a numeric price", () => {
    expect(formatPricePerHourOrNull(20)).toBe("\u20AC20/hr");
  });

  it("returns null for null", () => {
    expect(formatPricePerHourOrNull(null)).toBeNull();
  });
});

describe("formatBookingMethod", () => {
  it("maps known methods", () => {
    expect(formatBookingMethod("playtomic")).toBe("Playtomic");
    expect(formatBookingMethod("own_app")).toBe("Venue App");
    expect(formatBookingMethod("website")).toBe("Website");
    expect(formatBookingMethod("phone")).toBe("Phone");
  });

  it("falls back to Website for unknown / null", () => {
    expect(formatBookingMethod("walk_in")).toBe("Website");
    expect(formatBookingMethod(null)).toBe("Website");
  });
});
