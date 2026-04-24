"use client";

import { useState } from "react";

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreatePostDialog({ open, onClose }: CreatePostDialogProps) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("18:00");
  const [skillLevel, setSkillLevel] = useState("any");
  const [playersNeeded, setPlayersNeeded] = useState(1);
  const [message, setMessage] = useState("");

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will connect to Supabase later
    alert("Post creation will be connected to Supabase. Fill in your .env.local first!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet */}
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

          {/* Skill Level */}
          <div>
            <label className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2 block">
              Skill Level
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(["any", "beginner", "intermediate", "advanced"] as const).map(
                (level) => (
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
                )
              )}
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

          <button
            type="submit"
            className="w-full h-12 rounded-2xl signature-gradient text-on-primary font-headline font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Post Game
          </button>
        </form>
      </div>
    </div>
  );
}
