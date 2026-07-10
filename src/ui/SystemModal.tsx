import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActiveModal, useStore } from '../store/useStore';
import { systemById } from '../data/systems';
import { kpiById } from '../data/kpis';
import { ACCENT_HEX } from '../data/brand';
import type { KPI, SystemStatus } from '../data/types';
import { AnimatedNumber } from './AnimatedNumber';

const STATUS_LABEL: Record<SystemStatus, string> = {
  live: 'Connected',
  planned: 'Planned',
  candidate: 'Candidate',
  core: 'Core',
};

const STATUS_COLOR: Record<SystemStatus, string> = {
  live: '#34D399',
  planned: '#2EC5C5',
  candidate: '#D6BF91',
  core: '#D6BF91',
};

function fmtKpiValue(kpi: KPI, value: number): string {
  return kpi.unit === '%' || kpi.unit === 'days'
    ? `${value}${kpi.unit === '%' ? '%' : ' days'}`
    : String(value);
}

function MifoKpiRow({ kpi }: { kpi: KPI }) {
  const max = Math.max(kpi.baseline, kpi.target);
  const baselinePct = (kpi.baseline / max) * 100;
  const targetPct = (kpi.target / max) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-slide-caption text-mist">
          {kpi.name}
          {kpi.unit === 'index' && (
            <span className="ml-1 text-mist/60">(index)</span>
          )}
        </span>
        <span className="font-mono text-slide-caption text-paper/80">
          {fmtKpiValue(kpi, kpi.baseline)} →{' '}
          <span className="font-semibold text-sea">
            <AnimatedNumber value={kpi.target} />
            {kpi.unit === '%' ? '%' : ''}
          </span>
        </span>
      </div>
      <div className="relative mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-sea"
          initial={{ width: `${baselinePct}%` }}
          animate={{ width: `${targetPct}%` }}
          transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        />
        <div
          className="absolute top-0 h-full w-px bg-paper/60"
          style={{ left: `${baselinePct}%` }}
        />
      </div>
    </div>
  );
}

function MifoOutcomeCards() {
  const forecast = kpiById.forecast_accuracy;
  const service = kpiById.service_level;
  const costPerKg = kpiById.cost_per_kg;
  const ebitda = kpiById.ebitda;
  const [openIdx, setOpenIdx] = useState(0);

  const cards = [
    {
      claim: 'Margin before the quote',
      support:
        'Every quote is priced against live cost and capacity — not last month\'s spreadsheet.',
      tag: `${costPerKg.name} · ${ebitda.name}`,
      kpis: [costPerKg, ebitda],
    },
    {
      claim: `Forecast accuracy ${forecast.baseline}% → ${forecast.target}%`,
      support:
        'The factory plans against real demand signals instead of manual estimates.',
      tag: forecast.name,
      kpis: [forecast],
    },
    {
      claim: `Service level ${service.baseline}% → ${service.target}%`,
      support: 'Fewer missed delivery promises; stickier customer relationships.',
      tag: service.name,
      kpis: [service],
    },
  ];

  return (
    <div className="mt-4 space-y-2.5">
      <div className="font-mono text-slide-caption uppercase tracking-[0.18em] text-mist/70">
        Outcomes · click to explore
      </div>
      {cards.map((card, i) => {
        const open = openIdx === i;
        return (
          <button
            key={card.claim}
            type="button"
            onClick={() => setOpenIdx(i)}
            className={`block w-full rounded-xl border p-3 text-left transition-colors ${
              open
                ? 'border-gold/35 bg-white/5'
                : 'border-white/10 bg-white/5 hover:border-gold/25'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-slide-caption font-semibold text-paper">
                {card.claim}
              </span>
              <motion.span
                animate={{ rotate: open ? 90 : 0 }}
                transition={{ duration: 0.25 }}
                className={open ? 'text-gold' : 'text-mist/60'}
                aria-hidden
              >
                ›
              </motion.span>
            </div>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="mt-1.5 text-slide-caption leading-relaxed text-mist">
                    {card.support}
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {card.kpis.map((kpi) => (
                      <MifoKpiRow key={kpi.id} kpi={kpi} />
                    ))}
                  </div>
                  <span className="mt-3 inline-block rounded-md border border-gold/25 bg-gold/10 px-2 py-0.5 font-mono text-slide-caption uppercase tracking-[0.14em] text-gold/90">
                    {card.tag}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        );
      })}
    </div>
  );
}

export function SystemModal() {
  const modalId = useActiveModal();
  const closeModal = useStore((s) => s.closeModal);
  const mode = useStore((s) => s.mode);
  const chapter = useStore((s) => s.current());
  const sys = modalId ? systemById[modalId] : null;

  const showMifoOutcomeCards =
    sys?.id === 'mifo' && chapter.id === 'germany' && mode === 'strategic';

  return (
    <AnimatePresence>
      {sys && (
        <motion.aside
          key={`${chapter.id}-${sys.id}`}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto max-h-[calc(100vh-12rem)] w-[400px] overflow-y-auto rounded-2xl border border-white/10 bg-navy-900/80 p-5 shadow-panel backdrop-blur-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <div
                className="text-slide-caption uppercase tracking-[0.22em]"
                style={{ color: ACCENT_HEX[sys.accent] }}
              >
                {sys.short}
              </div>
              <h2 className="mt-1 font-display text-slide-title text-paper">{sys.name}</h2>
              <div className="mt-1 text-slide-caption text-mist">Owner: {sys.owner}</div>
            </div>
            <button
              onClick={closeModal}
              className="rounded-full border border-white/10 px-2 py-1 text-xs text-mist transition hover:text-paper"
            >
              ✕
            </button>
          </div>

          <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-slide-caption"
            style={{ borderColor: `${STATUS_COLOR[sys.status]}55`, color: STATUS_COLOR[sys.status] }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[sys.status] }} />
            {STATUS_LABEL[sys.status]}
          </div>

          {!showMifoOutcomeCards && (
            <p className="mt-4 text-slide-body leading-relaxed text-mist">{sys.description}</p>
          )}

          <button
            onClick={() => {
              useStore.getState().openApp(sys.id);
            }}
            className="mt-3.5 w-full rounded-lg border border-sea/40 bg-sea/10 px-4 py-2.5 text-slide-body font-medium text-sea transition hover:bg-sea/20"
          >
            View app — screenshot ↗
          </button>

          {showMifoOutcomeCards ? (
            <MifoOutcomeCards />
          ) : (
            <>
              <div className="mt-5">
                <div className="text-slide-caption uppercase tracking-[0.22em] text-mist">
                  Responsibilities
                </div>
                <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                  {sys.responsibilities.map((r) => (
                    <li key={r} className="flex items-center gap-2 text-slide-body text-paper/90">
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ background: ACCENT_HEX[sys.accent] }}
                      />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <div className="text-slide-caption uppercase tracking-[0.22em] text-mist">
                  KPI impact
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sys.businessKPIs.map((kid) => (
                    <span
                      key={kid}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-slide-caption text-paper/80"
                    >
                      {kpiById[kid]?.name ?? kid}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {mode === 'technical' && sys.connectedTo.length > 0 && (
            <div className="mt-5">
              <div className="text-slide-caption uppercase tracking-[0.22em] text-mist">
                Integrations
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {sys.connectedTo.map((cid) => (
                  <span
                    key={cid}
                    className="rounded-md border border-sea/20 bg-sea/5 px-2 py-1 text-slide-caption text-sea"
                  >
                    {systemById[cid]?.short ?? cid}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
