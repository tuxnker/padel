import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ActivityList } from "@/components/profile/activity-list";
import type { SkillLevel } from "@/types";
import { ProfileClient } from "./profile-client";
import { SignOutButton } from "./sign-out-button";

const settingsItems = [
  { icon: "notifications", label: "Notifications" },
  { icon: "mail", label: "Contact Preferences" },
  { icon: "shield", label: "Privacy & Security" },
];

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <div className="w-20 h-20 rounded-full signature-gradient flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-on-primary text-4xl">person</span>
        </div>
        <h1 className="font-headline text-2xl font-extrabold text-on-surface">
          Sign in to your profile
        </h1>
        <p className="text-sm text-on-surface-variant mt-2 mb-6">
          Track your games, connect with players, and manage your settings.
        </p>
        <Link
          href="/login"
          className="px-8 py-3 rounded-2xl signature-gradient text-on-primary font-headline font-bold text-sm uppercase tracking-wider"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, skill_level, area, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const displayName =
    profile?.name
    ?? user.user_metadata?.full_name
    ?? user.email?.split("@")[0]
    ?? "Player";

  const avatarUrl =
    profile?.avatar_url
    ?? user.user_metadata?.avatar_url
    ?? null;

  const skillLevel: SkillLevel = (profile?.skill_level as SkillLevel) ?? "beginner";

  return (
    <div className="pb-8 space-y-6">
      <ProfileHeader name={displayName} area={profile?.area ?? null} avatarUrl={avatarUrl} />
      <ProfileClient
        userId={user.id}
        initialSkillLevel={skillLevel}
        initialArea={profile?.area ?? null}
      />
      <ActivityList />
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
              <span className="material-symbols-outlined text-outline text-xl">{item.icon}</span>
              <span className="font-body text-sm text-on-surface">{item.label}</span>
            </div>
            <span className="material-symbols-outlined text-outline-variant text-lg">chevron_right</span>
          </button>
        ))}
      </div>
      <div className="px-5 text-center">
        <SignOutButton />
      </div>
    </div>
  );
}
