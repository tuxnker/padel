export function ActivityList() {
  return (
    <div className="px-5 space-y-4">
      <h2 className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface-variant">
        My Activity
      </h2>

      {/* Demo activity card */}
      <div className="bg-surface-container-lowest rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-lg">
              sports_tennis
            </span>
            <span className="text-xs font-headline uppercase tracking-wider">
              Posted 2d ago
            </span>
          </div>
          <span className="px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container font-headline text-xs font-bold uppercase">
            Open Match
          </span>
        </div>
        <p className="font-body text-sm text-on-surface">
          Looking for 2 more players for a friendly game at Padel04 this Friday
          at 6pm. Level 3.0-4.0 preferred!
        </p>
        <div className="flex items-center gap-4 text-on-surface-variant">
          <span className="flex items-center gap-1 text-xs">
            <span className="material-symbols-outlined text-sm">chat_bubble</span>
            4
          </span>
          <span className="flex items-center gap-1 text-xs">
            <span className="material-symbols-outlined text-sm">favorite</span>
            12
          </span>
        </div>
      </div>

      {/* Empty state if no activity */}
      <div className="text-center py-8">
        <p className="text-sm text-on-surface-variant">
          Your games and activity will appear here.
        </p>
      </div>
    </div>
  );
}
