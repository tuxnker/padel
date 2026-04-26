"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createPostSchema } from "@/lib/validators";
import { fetchCourtsForPicker, type PickerCourt } from "@/lib/posts";
import { dublinToday } from "@/lib/dates";
import type { LatLng } from "@/lib/geo";
import { haversineKm } from "@/lib/geo";
import type { UserLocationStatus } from "@/hooks/use-user-location";

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  initialCourtSlug?: string | null;
  userLocation?: LatLng | null;
  onRequestLocation?: () => void;
  locationStatus?: UserLocationStatus;
}

type SkillLevel = "any" | "beginner" | "intermediate" | "advanced";

export function CreatePostDialog({
  open,
  onClose,
  initialCourtSlug,
  userLocation,
  onRequestLocation,
  locationStatus,
}: CreatePostDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [date, setDate] = useState(dublinToday());
  const [time, setTime] = useState("18:00");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("any");
  const [playersNeeded, setPlayersNeeded] = useState(1);
  const [message, setMessage] = useState("");
  const [courtId, setCourtId] = useState<string>("");
  const [courtNameOverride, setCourtNameOverride] = useState("");
  const [venueMode, setVenueMode] = useState<"picker" | "other">("picker");
  const [courts, setCourts] = useState<PickerCourt[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !supabase) return;
    fetchCourtsForPicker(supabase).then((rows) => {
      setCourts(rows);
      if (initialCourtSlug) {
        const match = rows.find((r) => r.slug === initialCourtSlug);
        if (match) {
          setCourtId(match.id);
          setVenueMode("picker");
        }
      }
    });
  }, [open, supabase, initialCourtSlug]);

  const sortedCourts = useMemo(() => {
    if (!userLocation) return courts;
    const decorated = courts.map((c) => {
      const lat = c.latitude;
      const lng = c.longitude;
      const distance =
        typeof lat === "number" &&
        typeof lng === "number" &&
        Number.isFinite(lat) &&
        Number.isFinite(lng) &&
        Math.abs(lat) > 0 &&
        Math.abs(lng) > 0
          ? haversineKm(userLocation, { lat, lng })
          : Number.POSITIVE_INFINITY;
      return { court: c, distance };
    });
    decorated.sort((a, b) => a.distance - b.distance);
    return decorated.map((d) => ({ ...d.court, _distance: d.distance }));
  }, [courts, userLocation]);

  const handleUseNearest = () => {
    const loc = userLocation ?? null;
    if (!loc && onRequestLocation) {
      onRequestLocation();
      return;
    }
    if (!loc) return;
    const eligible = courts
      .map((c) => {
        const lat = c.latitude;
        const lng = c.longitude;
        if (
          typeof lat !== "number" ||
          typeof lng !== "number" ||
          !Number.isFinite(lat) ||
          !Number.isFinite(lng) ||
          Math.abs(lat) === 0 ||
          Math.abs(lng) === 0
        ) {
          return null;
        }
        return { court: c, distance: haversineKm(loc, { lat, lng }) };
      })
      .filter((x): x is { court: PickerCourt; distance: number } => x !== null)
      .sort((a, b) => a.distance - b.distance);
    if (eligible.length > 0) {
      setCourtId(eligible[0].court.id);
      setVenueMode("picker");
    }
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    if (!user) {
      router.push(`/login?next=${encodeURIComponent("/play?create=true")}`);
      return;
    }

    const parsed = createPostSchema.safeParse({
      courtId: venueMode === "picker" ? (courtId || undefined) : undefined,
      courtNameOverride:
        venueMode === "other" ? courtNameOverride.trim() || undefined : undefined,
      playDate: date,
      playTime: time,
      skillLevel,
      playersNeeded,
      message: message.trim() || undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setSubmitting(true);
    const { error: insertError } = await supabase.from("posts").insert({
      author_id: user.id,
      court_id: parsed.data.courtId ?? null,
      court_name_override: parsed.data.courtNameOverride ?? null,
      play_date: parsed.data.playDate,
      play_time: parsed.data.playTime,
      skill_level: parsed.data.skillLevel,
      players_needed: parsed.data.playersNeeded,
      message: parsed.data.message ?? null,
    });
    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    onClose();
    router.refresh();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-post-title"
      className="fixed inset-0 z-[60] flex items-end justify-center"
    >
      <div
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-3xl p-6 pb-10 animate-slide-up">
        <div className="w-10 h-1 bg-outline-variant/30 rounded-full mx-auto mb-6" />
        <div className="flex items-center justify-between mb-6">
          <h2
            id="create-post-title"
            className="font-headline text-xl font-extrabold text-on-surface"
          >
            Find Players
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 -mr-1 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 block">
                Date
              </label>
              <input
                type="date"
                value={date}
                min={dublinToday()}
                onChange={(e) => setDate(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
            <div>
              <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 block">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Where
              </label>
              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setVenueMode("picker")}
                  className={`px-2 py-0.5 rounded-full font-headline font-bold uppercase ${
                    venueMode === "picker"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  Listed
                </button>
                <button
                  type="button"
                  onClick={() => setVenueMode("other")}
                  className={`px-2 py-0.5 rounded-full font-headline font-bold uppercase ${
                    venueMode === "other"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  Other
                </button>
              </div>
            </div>
            {venueMode === "picker" ? (
              <div className="space-y-2">
                <select
                  value={courtId}
                  onChange={(e) => setCourtId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="" disabled>
                    {userLocation ? "Pick a venue (sorted by distance)…" : "Pick a venue…"}
                  </option>
                  {sortedCourts.map((c) => {
                    const distance = (c as PickerCourt & { _distance?: number })._distance;
                    const showDistance =
                      typeof distance === "number" && Number.isFinite(distance);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {showDistance ? ` — ${distance.toFixed(1)} km` : ""}
                      </option>
                    );
                  })}
                </select>
                <button
                  type="button"
                  onClick={handleUseNearest}
                  disabled={locationStatus === "loading" || locationStatus === "unavailable"}
                  className="text-xs font-headline font-bold uppercase tracking-wider text-secondary inline-flex items-center gap-1 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">near_me</span>
                  {userLocation ? "Pick nearest court" : "Use my location"}
                </button>
              </div>
            ) : (
              <input
                type="text"
                value={courtNameOverride}
                onChange={(e) => setCourtNameOverride(e.target.value)}
                placeholder="Venue name"
                maxLength={100}
                className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              />
            )}
          </div>

          {/* Skill Level */}
          <div>
            <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
              Skill Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["any", "beginner", "intermediate", "advanced"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSkillLevel(level)}
                  className={`py-2 rounded-xl font-headline text-xs font-bold capitalize transition-all ${
                    skillLevel === level
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Players needed */}
          <div>
            <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
              Players Needed
            </label>
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPlayersNeeded(n)}
                  className={`w-12 h-12 rounded-xl font-headline text-lg font-bold transition-all ${
                    playersNeeded === n
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 block">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell people about your game..."
              maxLength={500}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-surface-container-low text-on-surface font-body text-sm placeholder:text-outline-variant focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-error" role="alert">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 rounded-2xl signature-gradient text-on-primary font-headline font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            {submitting ? "Posting…" : "Post Game"}
          </button>
        </form>
      </div>
    </div>
  );
}
