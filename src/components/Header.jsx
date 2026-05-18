import { prettyDate, greeting } from '../utils/date.js'

export default function Header({ adminMode, onToggleAdmin, onOpenSettings }) {
  return (
    <header className="relative z-10 flex flex-wrap items-end justify-between gap-4 px-6 pt-8 pb-4 md:px-10 md:pt-10">
      <div>
        <div className="text-muted text-sm uppercase tracking-[0.18em]">
          Espinoza Family
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink mt-1">
          {greeting()}, family.
        </h1>
        <div className="mt-2 text-muted text-base md:text-lg">
          {prettyDate()}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="rounded-full border border-line bg-cream px-4 py-2 text-sm text-ink hover:bg-sand transition tap"
        >
          Settings
        </button>
        <button
          onClick={onToggleAdmin}
          className={`rounded-full px-4 py-2 text-sm tap transition border ${
            adminMode
              ? 'bg-ink text-cream border-ink'
              : 'bg-cream text-ink border-line hover:bg-sand'
          }`}
        >
          {adminMode ? 'Exit parent mode' : 'Parent mode'}
        </button>
      </div>
    </header>
  )
}
