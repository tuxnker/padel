import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatPrice(price: number | null): string {
  if (price === null) return "N/A";
  return `\u20AC${price.toFixed(0)}`;
}

export function formatPricePerHourOrNull(price: number | null): string | null {
  if (price === null) return null;
  return `${formatPrice(price)}/hr`;
}

export function formatBookingMethod(method: string | null): string {
  switch (method) {
    case "playtomic":
      return "Playtomic";
    case "own_app":
      return "Venue App";
    case "website":
      return "Website";
    case "phone":
      return "Phone";
    default:
      return "Website";
  }
}
