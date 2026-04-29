"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AREAS } from "@/lib/areas";
import { updateProfileSchema } from "@/lib/validators";
import { ProfileHeader } from "@/components/profile/profile-header";
import { SkillSelector } from "@/components/profile/skill-selector";
import type { SkillLevel } from "@/types";

type ContactPreference = "in_app" | "whatsapp";

interface ProfileClientProps {
  userId: string;
  initialName: string;
  initialSkillLevel: SkillLevel;
  initialArea: string | null;
  initialAvatarUrl: string | null;
  initialContactPreference: ContactPreference;
}

type NotificationPrefs = {
  openGames: boolean;
  playerRequests: boolean;
};

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  openGames: true,
  playerRequests: true,
};

function normaliseNotificationPrefs(value: unknown): NotificationPrefs {
  if (!value || typeof value !== "object") return DEFAULT_NOTIFICATION_PREFS;
  const prefs = value as Partial<NotificationPrefs>;
  return {
    openGames: prefs.openGames ?? DEFAULT_NOTIFICATION_PREFS.openGames,
    playerRequests:
      prefs.playerRequests ?? DEFAULT_NOTIFICATION_PREFS.playerRequests,
  };
}

export function ProfileClient({
  userId,
  initialName,
  initialSkillLevel,
  initialArea,
  initialAvatarUrl,
  initialContactPreference,
}: ProfileClientProps) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [area, setArea] = useState(initialArea);
  const [avatarUrl] = useState(initialAvatarUrl);
  const [contactPreference, setContactPreference] =
    useState<ContactPreference>(initialContactPreference);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>(initialSkillLevel);
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(initialName);
  const [draftArea, setDraftArea] = useState(initialArea ?? "");
  const [draftContactPreference, setDraftContactPreference] =
    useState<ContactPreference>(initialContactPreference);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (values: Record<string, unknown>) => {
    const supabase = createClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error: updateError } = await supabase
      .from("users")
      .update(values)
      .eq("id", userId);
    if (updateError) throw updateError;
  };

  const handleSkillChange = async (next: SkillLevel) => {
    const previous = skillLevel;
    setSkillLevel(next);
    setError(null);

    try {
      await updateUser({ skill_level: next });
      router.refresh();
    } catch (updateError) {
      setSkillLevel(previous);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update skill level.",
      );
    }
  };

  const openEditor = () => {
    setDraftName(name);
    setDraftArea(area ?? "");
    setDraftContactPreference(contactPreference);
    setError(null);
    setEditing(true);
  };

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const parsed = updateProfileSchema.safeParse({
      name: draftName.trim(),
      skillLevel,
      area: draftArea.trim() || undefined,
      contactPreference: draftContactPreference,
    });

    if (!parsed.success) {
      setSaving(false);
      setError(parsed.error.issues[0]?.message ?? "Invalid profile details.");
      return;
    }

    try {
      await updateUser({
        name: parsed.data.name,
        area: parsed.data.area ?? null,
        contact_preference: parsed.data.contactPreference,
      });
      setName(parsed.data.name);
      setArea(parsed.data.area ?? null);
      setContactPreference(
        parsed.data.contactPreference ?? contactPreference,
      );
      setEditing(false);
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ProfileHeader
        name={name}
        area={area}
        avatarUrl={avatarUrl}
        onEdit={openEditor}
      />
      <SkillSelector selected={skillLevel} onChange={handleSkillChange} />
      {error && (
        <p className="px-5 text-sm text-error" role="alert">
          {error}
        </p>
      )}
      <div className="px-5">
        <div className="bg-surface-container-low rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-2xl">
              near_me
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-headline text-sm font-bold text-on-surface">
              Preferred Neighbourhood
            </h3>
            <p className="text-xs text-on-surface-variant">
              {area ?? "Not set"}
            </p>
          </div>
          <button
            type="button"
            onClick={openEditor}
            className="font-headline text-sm font-bold text-secondary active:scale-95 transition-transform"
          >
            Change
          </button>
        </div>
      </div>

      {editing && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-title"
          className="fixed inset-0 z-[70] flex items-end justify-center"
        >
          <button
            type="button"
            aria-label="Close edit profile"
            className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm"
            onClick={() => setEditing(false)}
          />
          <form
            onSubmit={handleProfileSubmit}
            className="relative w-full max-w-lg rounded-t-3xl bg-surface-container-lowest p-6 pb-10 animate-slide-up"
          >
            <div className="w-10 h-1 bg-outline-variant/30 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-6">
              <h2
                id="edit-profile-title"
                className="font-headline text-xl font-extrabold text-on-surface"
              >
                Edit Profile
              </h2>
              <button
                type="button"
                onClick={() => setEditing(false)}
                aria-label="Close"
                className="w-9 h-9 -mr-1 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Display Name
                </span>
                <input
                  type="text"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="mt-1.5 w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </label>

              <label className="block">
                <span className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Preferred Neighbourhood
                </span>
                <select
                  value={draftArea}
                  onChange={(event) => setDraftArea(event.target.value)}
                  className="mt-1.5 w-full h-11 px-3 rounded-xl bg-surface-container-low text-on-surface font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Not set</option>
                  {AREAS.map((areaOption) => (
                    <option key={areaOption.slug} value={areaOption.name}>
                      {areaOption.name}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset>
                <legend className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  Contact Preference
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {[
                    { value: "in_app", label: "In App" },
                    { value: "whatsapp", label: "WhatsApp" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setDraftContactPreference(
                          option.value as ContactPreference,
                        )
                      }
                      className={`h-11 rounded-xl border font-headline text-sm font-bold transition ${
                        draftContactPreference === option.value
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline-variant bg-surface-container-low text-on-surface"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <button
                type="submit"
                disabled={saving}
                className="w-full h-12 rounded-2xl bg-primary text-on-primary font-headline font-bold text-sm uppercase tracking-wider active:scale-[0.98] hover:bg-primary-dim transition disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

interface ProfileSettingsProps {
  userId: string;
  initialContactPreference: ContactPreference;
  initialNotificationPrefs: unknown;
}

type SettingsPanel = "notifications" | "contact" | "privacy" | null;

export function ProfileSettings({
  userId,
  initialContactPreference,
  initialNotificationPrefs,
}: ProfileSettingsProps) {
  const router = useRouter();
  const [panel, setPanel] = useState<SettingsPanel>(null);
  const [contactPreference, setContactPreference] =
    useState<ContactPreference>(initialContactPreference);
  const [notificationPrefs, setNotificationPrefs] = useState(
    normaliseNotificationPrefs(initialNotificationPrefs),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updateUser = async (values: Record<string, unknown>) => {
    const supabase = createClient();
    if (!supabase) throw new Error("Supabase is not configured.");
    const { error: updateError } = await supabase
      .from("users")
      .update(values)
      .eq("id", userId);
    if (updateError) throw updateError;
  };

  const saveContactPreference = async (next: ContactPreference) => {
    const previous = contactPreference;
    setContactPreference(next);
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateUser({ contact_preference: next });
      setMessage("Contact preference saved.");
      router.refresh();
    } catch (updateError) {
      setContactPreference(previous);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not save contact preference.",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationPrefs = async (next: NotificationPrefs) => {
    const previous = notificationPrefs;
    setNotificationPrefs(next);
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await updateUser({ notification_prefs: next });
      setMessage("Notification preferences saved.");
      router.refresh();
    } catch (updateError) {
      setNotificationPrefs(previous);
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Could not save notification preferences.",
      );
    } finally {
      setSaving(false);
    }
  };

  const closePanel = () => {
    setPanel(null);
    setMessage(null);
    setError(null);
  };

  const settingsItems = [
    { key: "notifications", icon: "notifications", label: "Notifications" },
    { key: "contact", icon: "mail", label: "Contact Preferences" },
    { key: "privacy", icon: "shield", label: "Privacy & Security" },
  ] as const;

  return (
    <div className="px-5 space-y-1">
      <h2 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-3">
        Account Settings
      </h2>
      {settingsItems.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => {
            setPanel(item.key);
            setMessage(null);
            setError(null);
          }}
          className="w-full flex items-center justify-between py-4 px-4 rounded-xl bg-surface-container-lowest mb-2 text-left active:scale-[0.99] transition-transform"
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

      {panel && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="profile-settings-title"
          className="fixed inset-0 z-[70] flex items-end justify-center"
        >
          <button
            type="button"
            aria-label="Close settings"
            className="absolute inset-0 bg-inverse-surface/50 backdrop-blur-sm"
            onClick={closePanel}
          />
          <div className="relative w-full max-w-lg rounded-t-3xl bg-surface-container-lowest p-6 pb-10 animate-slide-up">
            <div className="w-10 h-1 bg-outline-variant/30 rounded-full mx-auto mb-6" />
            <div className="flex items-center justify-between mb-6">
              <h2
                id="profile-settings-title"
                className="font-headline text-xl font-extrabold text-on-surface"
              >
                {panel === "notifications" && "Notifications"}
                {panel === "contact" && "Contact Preferences"}
                {panel === "privacy" && "Privacy & Security"}
              </h2>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close"
                className="w-9 h-9 -mr-1 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-low active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {panel === "notifications" && (
              <div className="space-y-3">
                <ToggleRow
                  title="Open game alerts"
                  description="Notify me when players post games near my area."
                  checked={notificationPrefs.openGames}
                  disabled={saving}
                  onChange={(checked) =>
                    void saveNotificationPrefs({
                      ...notificationPrefs,
                      openGames: checked,
                    })
                  }
                />
                <ToggleRow
                  title="Player requests"
                  description="Notify me when someone responds to my games."
                  checked={notificationPrefs.playerRequests}
                  disabled={saving}
                  onChange={(checked) =>
                    void saveNotificationPrefs({
                      ...notificationPrefs,
                      playerRequests: checked,
                    })
                  }
                />
              </div>
            )}

            {panel === "contact" && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "in_app", label: "In App" },
                  { value: "whatsapp", label: "WhatsApp" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={saving}
                    onClick={() =>
                      void saveContactPreference(
                        option.value as ContactPreference,
                      )
                    }
                    className={`h-11 rounded-xl border font-headline text-sm font-bold transition disabled:opacity-60 ${
                      contactPreference === option.value
                        ? "border-primary bg-primary text-on-primary"
                        : "border-outline-variant bg-surface-container-low text-on-surface"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {panel === "privacy" && (
              <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4 space-y-2">
                <p className="text-sm text-on-surface">
                  Your public profile shows your display name, skill level, and
                  preferred neighbourhood so nearby players can match with you.
                </p>
                <p className="text-xs text-on-surface-variant">
                  Authentication and account access are managed securely by OM
                  Player sign-in.
                </p>
              </div>
            )}

            {message && (
              <p className="mt-4 text-sm text-primary" role="status">
                {message}
              </p>
            )}
            {error && (
              <p className="mt-4 text-sm text-error" role="alert">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant bg-surface-container-low p-4">
      <span>
        <span className="block font-headline text-sm font-bold text-on-surface">
          {title}
        </span>
        <span className="mt-1 block text-xs text-on-surface-variant">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-primary"
      />
    </label>
  );
}
