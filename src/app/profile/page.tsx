"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ProfileHeader } from "@/components/profile/profile-header";
import { SkillSelector } from "@/components/profile/skill-selector";
import { ActivityList } from "@/components/profile/activity-list";
import type { SkillLevel } from "@/types";
import Link from "next/link";

const settingsItems = [
  { icon: "notifications", label: "Notifications" },
  { icon: "mail", label: "Contact Preferences" },
  { icon: "shield", label: "Privacy & Security" },
];

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const [skillLevel, setSkillLevel] = useState<SkillLevel>("intermediate");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full signature-gradient flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-on-primary text-4xl">
            person
          </span>
        </div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">
          Sign in to your profile
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 mb-6">
          Track your games, connect with players, and manage your settings.
        </p>
        <Link
          href="/login"
          className="px-8 py-3 rounded-2xl signature-gradient text-on-primary font-headline font-bold text-sm uppercase tracking-wider active:scale-[0.98] transition-transform"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "Player";

  return (
    <div className="pb-8 space-y-6">
      <ProfileHeader
        name={displayName}
        area={null}
        avatarUrl={user.user_metadata?.avatar_url || null}
      />

      <SkillSelector selected={skillLevel} onChange={setSkillLevel} />

      {/* Preferred Neighborhood */}
      <div className="px-5">
        <div className="bg-surface-container-low rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">
              near_me
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline text-sm font-bold text-on-surface">
              Preferred Neighborhood
            </h3>
            <p className="text-xs text-on-surface-variant">
              Ballsbridge & Sandymount
            </p>
          </div>
          <button className="font-headline text-sm font-bold text-secondary">
            Change
          </button>
        </div>
      </div>

      <ActivityList />

      {/* Account Settings */}
      <div className="px-5 space-y-1">
        <h2 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
          Account Settings
        </h2>
        {settingsItems.map((item) => (
          <button
            key={item.label}
            className="w-full flex items-center justify-between py-4 px-4 rounded-xl bg-surface-container-lowest mb-2"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-outline text-xl">
                {item.icon}
              </span>
              <span className="font-body text-sm text-on-surface">
                {item.label}
              </span>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-lg">
              chevron_right
            </span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="px-5 text-center">
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 font-headline text-sm font-bold text-error"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Logout
        </button>
      </div>
    </div>
  );
}
