"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SkillSelector } from "@/components/profile/skill-selector";
import type { SkillLevel } from "@/types";

interface ProfileClientProps {
  userId: string;
  initialSkillLevel: SkillLevel;
  initialArea: string | null;
}

export function ProfileClient({
  userId,
  initialSkillLevel,
  initialArea,
}: ProfileClientProps) {
  const router = useRouter();
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(initialSkillLevel);
  const [error, setError] = useState<string | null>(null);

  const onChange = async (next: SkillLevel) => {
    const previous = skillLevel;
    setSkillLevel(next);
    setError(null);

    const supabase = createClient();
    if (!supabase) return;
    const { error: updateError } = await supabase
      .from("users")
      .update({ skill_level: next })
      .eq("id", userId);
    if (updateError) {
      setSkillLevel(previous);
      setError(updateError.message);
      return;
    }
    router.refresh();
  };

  return (
    <>
      <SkillSelector selected={skillLevel} onChange={onChange} />
      {error && <p className="px-5 text-sm text-error" role="alert">{error}</p>}
      <div className="px-5">
        <div className="bg-surface-container-low rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">near_me</span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline text-sm font-bold text-on-surface">
              Preferred Neighbourhood
            </h3>
            <p className="text-xs text-on-surface-variant">
              {initialArea ?? "Not set"}
            </p>
          </div>
          <button className="font-headline text-sm font-bold text-secondary" disabled>
            Change
          </button>
        </div>
      </div>
    </>
  );
}
