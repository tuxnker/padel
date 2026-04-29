import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ActivityList } from "@/components/profile/activity-list";
import type { SkillLevel } from "@/types";
import { ProfileClient, ProfileSettings } from "./profile-client";
import { SignOutButton } from "./sign-out-button";

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
          href="/login?next=%2Fprofile"
          className="px-8 py-3 rounded-2xl signature-gradient text-on-primary font-headline font-bold text-sm uppercase tracking-wider"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("users")
    .select("name, skill_level, area, avatar_url, contact_preference, notification_prefs")
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
      <ProfileClient
        userId={user.id}
        initialName={displayName}
        initialSkillLevel={skillLevel}
        initialArea={profile?.area ?? null}
        initialAvatarUrl={avatarUrl}
        initialContactPreference={profile?.contact_preference ?? "in_app"}
      />
      <ActivityList userId={user.id} />
      <ProfileSettings
        userId={user.id}
        initialContactPreference={profile?.contact_preference ?? "in_app"}
        initialNotificationPrefs={profile?.notification_prefs}
      />
      <div className="px-5 text-center">
        <SignOutButton />
      </div>
    </div>
  );
}
