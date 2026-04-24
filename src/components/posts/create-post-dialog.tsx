"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { createPostSchema } from "@/lib/validators";
import { fetchCourtsForPicker } from "@/lib/posts";

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
}

type SkillLevel = "any" | "beginner" | "intermediate" | "advanced";

export function CreatePostDialog({ open, onClose }: CreatePostDialogProps) {
  const router = useRouter();
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("18:00");
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("any");
  const [playersNeeded, setPlayersNeeded] = useState(1);
  const [message, setMessage] = useState("");
  const [courtId, setCourtId] = useState<string>("");
  const [courts, setCourts] = useState<Array<{ id: string; name: string }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !supabase) return;
    fetchCourtsForPicker(supabase).then(setCourts);
  }, [open, supabase]);

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
      courtId: courtId || undefined,
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-3xl p-6 pb-10 animate-slide-up">
        <div className="w-10 h-1 bg-outline-variant/30 rounded-full mx-auto mb-6" />
        <h2 className="font-headline text-xl font-extrabold text-on-surface mb-6">
          Find Players
        </h2>

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
                min={new Date().toISOString().split("T")[0]}
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

          {/* Court */}
          <div>
            <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1.5 block">
              Where
            </label>
            <select
              value={courtId}
              onChange={(e) => setCourtId(e.target.value)}
              className="w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              required
            >
              <option value="" disabled>Pick a venue…</option>
              {courts.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
