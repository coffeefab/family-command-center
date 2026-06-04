import MonthCalendar from './MonthCalendar.jsx'

// Full-screen calendar used from the kids' lobby. Wraps the reusable
// MonthCalendar with page chrome (back / parent buttons, footer).
export default function FamilyCalendar({
  events,
  children,
  adminMode = false,
  onAdd,
  onEdit,
  onBack,
  onParent
}) {
  return (
    <div className="paper relative min-h-screen">
      {/* Top nav */}
      <div className="relative z-10 flex items-center justify-between px-6 md:px-10 pt-6">
        <button
          onClick={onBack}
          className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink hover:bg-sand tap"
        >
          ← Back to home
        </button>
        <div className="flex items-center gap-2">
          <div className="text-xs uppercase tracking-[0.22em] text-muted hidden sm:block">
            Returns home in 1 minute of quiet
          </div>
          {!adminMode && (
            <button
              onClick={onParent}
              className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink hover:bg-sand tap"
            >
              Parent mode
            </button>
          )}
        </div>
      </div>

      <main className="relative z-10 px-6 md:px-10 pt-6 pb-6">
        <MonthCalendar
          events={events}
          children={children}
          adminMode={adminMode}
          onAdd={onAdd}
          onEdit={onEdit}
        />
      </main>

      <footer className="relative z-10 px-6 md:px-10 pb-10 pt-2 text-center text-xs text-muted">
        Castelan Family Command Center.
      </footer>
    </div>
  )
}
