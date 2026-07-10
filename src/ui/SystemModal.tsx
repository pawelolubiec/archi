import { motion, AnimatePresence } from 'framer-motion';
import { useActiveModal, useStore } from '../store/useStore';
import { systemById } from '../data/systems';
import { kpiById } from '../data/kpis';
import { ACCENT_HEX } from '../data/brand';
import type { SystemStatus } from '../data/types';

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

function MifoOutcomeCards() {
  const forecast = kpiById.forecast_accuracy;
  const service = kpiById.service_level;
  const costPerKg = kpiById.cost_per_kg;
  const ebitda = kpiById.ebitda;

  const cards = [
    {
      claim: 'Margin before the quote',
      support:
        'Every quote is priced against live cost and capacity — not last month\'s spreadsheet.',
      tag: `${costPerKg.name} · ${ebitda.name}`,
    },
    {
      claim: `Forecast accuracy ${forecast.baseline}% → ${forecast.target}%`,
      support:
        'The factory plans against real demand signals instead of manual estimates.',
      tag: forecast.name,
    },
    {
      claim: `Service level ${service.baseline}% → ${service.target}%`,
      support: 'Fewer missed delivery promises; stickier customer relationships.',
      tag: service.name,
    },
  ];

  return (
    <div className="mt-5 space-y-3">
      {cards.map((card) => (
        <div
          key={card.claim}
          className="rounded-xl border border-white/10 bg-white/5 p-3.5"
        >
          <div className="text-slide-caption font-semibold text-paper">{card.claim}</div>
          <p className="mt-1.5 text-slide-caption leading-relaxed text-mist">{card.support}</p>
          <span className="mt-2 inline-block rounded-md border border-gold/25 bg-gold/10 px-2 py-0.5 font-mono text-slide-caption uppercase tracking-[0.14em] text-gold/90">
            {card.tag}
          </span>
        </div>
      ))}
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
          className="pointer-events-auto w-[400px] rounded-2xl border border-white/10 bg-navy-900/80 p-6 shadow-panel backdrop-blur-md"
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

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-slide-caption"
            style={{ borderColor: `${STATUS_COLOR[sys.status]}55`, color: STATUS_COLOR[sys.status] }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[sys.status] }} />
            {STATUS_LABEL[sys.status]}
          </div>

          <p className="mt-4 text-slide-body leading-relaxed text-mist">{sys.description}</p>

          <button
            onClick={() => {
              useStore.getState().openApp(sys.id);
            }}
            className="mt-4 w-full rounded-lg border border-sea/40 bg-sea/10 px-4 py-3 text-slide-body font-medium text-sea transition hover:bg-sea/20"
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
