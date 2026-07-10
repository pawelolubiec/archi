interface Field {
  label: string;
  value: string;
}

const FIELDS: Field[] = [
  { label: 'Business owner', value: 'Director of Operations' },
  { label: 'IT owner', value: 'Head of IT / CISO' },
  { label: 'Business case', value: 'Shared template' },
  { label: 'Stage-gate', value: 'G0 → G4' },
  { label: 'Dashboard', value: 'Board portfolio' },
];

const PRINCIPLES = [
  'One methodology for evaluating initiatives',
  'One project portfolio',
  'One owner for every KPI',
  'One business case template',
  'One stage-gate',
  'One board dashboard',
];

export function GovernanceCard() {
  return (
    <div className="pointer-events-auto w-full max-w-4xl">
      <div className="flex gap-6">
        <div className="flex-1 rounded-2xl border border-white/10 bg-navy-900/60 p-6 backdrop-blur-sm">
          <div className="text-slide-kicker uppercase tracking-eyebrow text-gold">
            Accountability model
          </div>
          <h3 className="mt-2 font-display text-slide-title text-paper">
            One methodology for the entire portfolio
          </h3>
          <ul className="mt-4 grid grid-cols-2 gap-3">
            {PRINCIPLES.map((p) => (
              <li key={p} className="flex items-center gap-2 text-slide-body text-paper/90">
                <span className="h-1.5 w-1.5 rounded-full bg-sea" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-72 shrink-0 rounded-2xl border border-gold/30 bg-navy-900/70 p-5 backdrop-blur-sm">
          <div className="text-slide-caption uppercase tracking-[0.22em] text-gold">
            Initiative card
          </div>
          <div className="mt-3 space-y-3">
            {FIELDS.map((f) => (
              <div key={f.label} className="flex justify-between text-slide-body">
                <span className="text-mist">{f.label}</span>
                <span className="text-paper/90">{f.value}</span>
              </div>
            ))}
            <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-slide-body">
              <span className="text-mist">Board decision</span>
              <span className="rounded-full bg-green/15 px-2.5 py-0.5 text-slide-caption text-green">
                Go / No-go
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* compliance and cyber risk pillar */}
      <div className="mt-4 flex items-center gap-6 rounded-2xl border border-sea/25 bg-navy-900/60 px-6 py-4 backdrop-blur-sm">
        <div className="shrink-0">
          <div className="text-slide-caption uppercase tracking-[0.22em] text-sea">
            Compliance and cyber resilience
          </div>
          <div className="mt-1 font-display text-slide-title text-paper">NIS2 / KSC · Cyber</div>
        </div>
        <div className="flex flex-1 flex-wrap items-center gap-x-6 gap-y-2 text-slide-body">
          <span className="text-paper/85">
            <span className="text-gold">Oct 2026</span> — KSC registry entry
          </span>
          <span className="text-paper/85">
            <span className="text-gold">Apr 2027</span> — full implementation
          </span>
          <span className="text-paper/85">
            Cyber insurance: recommended limit <span className="text-gold">€3–5M</span>
          </span>
          <span className="text-mist">
            The program runs per the approved project charter — the same stage-gate as the portfolio.
          </span>
        </div>
      </div>
    </div>
  );
}
