import { getInitials } from "@/lib/utils";

interface ProfileHeaderProps {
  name: string;
  area: string | null;
  avatarUrl: string | null;
}

export function ProfileHeader({ name, area, avatarUrl }: ProfileHeaderProps) {
  const initials = getInitials(name);

  return (
    <div className="flex flex-col items-center py-8 px-5">
      <div className="relative">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-28 h-28 rounded-full object-cover ring-4 ring-primary-container"
          />
        ) : (
          <div className="w-28 h-28 rounded-full signature-gradient flex items-center justify-center ring-4 ring-primary-container">
            <span className="font-headline text-4xl font-bold text-on-primary">
              {initials}
            </span>
          </div>
        )}
        <button className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-sm">edit</span>
        </button>
      </div>
      <h1 className="font-headline text-3xl font-extrabold text-on-surface mt-4 tracking-tight">
        {name}
      </h1>
      <p className="text-sm text-on-surface-variant mt-1">
        {area || "Dublin"} • Member since 2024
      </p>
    </div>
  );
}
