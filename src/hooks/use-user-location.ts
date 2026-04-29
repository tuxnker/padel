"use client";

import { useCallback, useEffect, useState } from "react";
import type { LatLng } from "@/lib/geo";

const STORAGE_KEY = "om-player:user-location";
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

type StoredLocation = LatLng & { timestamp: number };

export type UserLocationStatus =
  | "idle"
  | "loading"
  | "granted"
  | "denied"
  | "unavailable";

function readStoredLocation(): LatLng | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredLocation>;
    if (
      typeof parsed.lat !== "number" ||
      typeof parsed.lng !== "number" ||
      typeof parsed.timestamp !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.timestamp > MAX_AGE_MS) return null;
    return { lat: parsed.lat, lng: parsed.lng };
  } catch {
    return null;
  }
}

function writeStoredLocation(loc: LatLng) {
  if (typeof window === "undefined") return;
  try {
    const stored: StoredLocation = { ...loc, timestamp: Date.now() };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  } catch {
    // ignore quota / private mode failures
  }
}

function clearStoredLocation() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function useUserLocation() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [status, setStatus] = useState<UserLocationStatus>("idle");

  useEffect(() => {
    const cached = readStoredLocation();
    if (cached) {
      // SSR renders with no localStorage; we hydrate client-side state once
      // here. Lazy useState initializers would run during SSR with no window
      // and cause a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocation(cached);
      setStatus("granted");
    }
  }, []);

  const requestLocation = useCallback((): Promise<LatLng | null> => {
    if (typeof window === "undefined") return Promise.resolve(null);
    if (!("geolocation" in navigator)) {
      setStatus("unavailable");
      return Promise.resolve(null);
    }
    setStatus("loading");
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const next: LatLng = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setLocation(next);
          setStatus("granted");
          writeStoredLocation(next);
          resolve(next);
        },
        () => {
          setStatus("denied");
          resolve(null);
        },
        {
          enableHighAccuracy: false,
          timeout: 10_000,
          maximumAge: 1000 * 60 * 30,
        },
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setStatus("idle");
    clearStoredLocation();
  }, []);

  return { location, status, requestLocation, clearLocation };
}
