import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const GOLD = '#D6BF91';
const SEA = '#2EC5C5';
const GREEN = '#34D399';
const RED = '#ff9d9d';

const AUTO_ADVANCE_MS = 2600;

interface Stage {
  window: string;
  title: string;
  detail: string;
  enabledBy: string;
  accent: string;
}

const ACQUIRE_STAGES: Stage[] = [
  {
    window: 'Day 0–30',
    title: 'Commercial docking — MiFo',
    detail:
      'MiFo accounts over their existing sales tool. Quoting through MiFo in 30 days — demand reaches the factory same-day.',
    enabledBy: 'AI customer & product matching into group master data',
    accent: GREEN,
  },
  {
    window: 'Day 30–60',
    title: 'Data docking — one connector',
    detail:
      'Their systems feed the lakehouse through the canonical contracts. Group BI and forecasting see the entity.',
    enabledBy:
      'Canonical data contracts — connector #N+1, never point-to-point; AI agents cover the entity automatically',
    accent: SEA,
  },
  {
    window: 'Day 60–90',
    title: 'Finance docking — consolidation feed',
    detail:
      'Trial balance maps to the group chart of accounts in the lean group ERP. Their local ERP stays for statutory needs.',
    enabledBy: 'Group chart-of-accounts mapping — no forced ERP migration',
    accent: GOLD,
  },
];

const DIVEST_STAGES: Stage[] = [
  {
    window: 'Step 1',
    title: 'Connectors unplugged',
    detail:
      'Orders re-route to the buyer, the data connector is switched off, per-entity seats lapse at renewal.',
    enabledBy: 'Nothing entity-specific lives in the core — only connectors and seats',
    accent: RED,
  },
  {
    window: 'Step 2',
    title: 'Entity handed over — clean',
    detail:
      'Their local systems go with them, as-is. No carve-out project, no transition service agreement, no unused licenses left behind.',
    enabledBy: 'Entity-tagged data — separation is a query, not surgery',
    accent: RED,
  },
];

const HYBRID_BENEFITS = [
  {
    title: 'No forced ERP migration',
    detail: 'Acquired offices keep local statutory ERP; the group gets a consolidation feed only.',
  },
  {
    title: 'Three contracts, not fifty integrations',
    detail: 'Commercial (MiFo), data (lakehouse), finance — not point-to-point per app.',
  },
  {
    title: 'Clean exit on divestment',
    detail: 'Unplug connectors; no carve-out project and no unused licenses left behind.',
  },
  {
    title: 'Speed to quote',
    detail: 'AI-assisted schema mapping gets a new office quoting through MiFo in ~30 days.',
  },
  {
    title: 'Financial core stays small',
    detail: 'ERP remains the ledger; operations stay in PTS, PID, and WMS where work happens.',
  },
];

const CONTRACTS = [
  { label: 'Commercial → MiFo', desc: 'quotes, orders, forecast', accent: GREEN },
  { label: 'Data → Lakehouse', desc: 'one canonical connector', accent: SEA },
  { label: 'Finance → lean ERP', desc: 'consolidation feed only', accent: GOLD },
];

export function GrowthPanel() {
  const demo = useStore((s) => s.growthDemo);
  const setDemo = useStore((s) => s.setGrowthDemo);

  const stages = demo?.mode === 'divest' ? DIVEST_STAGES : ACQUIRE_STAGES;
  const stage = demo ? stages[demo.stage - 1] : null;
  const isLast = demo ? demo.stage >= stages.length : false;

  // auto-advance the docking sequence
  useEffect(() => {
    if (!demo || demo.stage >= stages.length) return;
    const t = setTimeout(
      () => setDemo({ mode: demo.mode, stage: demo.stage + 1 }),
      AUTO_ADVANCE_MS,
    );
    return () => clearTimeout(t);
  }, [demo, stages.length, setDemo]);

  return (
    <div className="pointer-events-auto flex w-[min(52rem,92vw)] flex-col gap-3 lg:flex-row lg:items-start">
      <div className="w-full shrink-0 rounded-2xl border border-white/10 bg-navy-900/80 p-4 shadow-panel backdrop-blur-md lg:w-[17rem]">
        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-sea">
          Hybrid architecture — why it works
        </div>
        <ul className="mt-3 space-y-2.5">
          {HYBRID_BENEFITS.map((b, i) => (
            <motion.li
              key={b.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
            >
              <div className="text-sm font-medium text-paper">{b.title}</div>
              <div className="mt-0.5 text-xs leading-relaxed text-mist/80">{b.detail}</div>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="w-[400px] max-w-full">
      <AnimatePresence mode="wait">
        {!demo ? (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="rounded-2xl border border-white/10 bg-navy-900/85 p-5 shadow-panel backdrop-blur-md"
          >
            <div className="font-mono text-xs uppercase tracking-[0.18em] text-mist">
              M&amp;A stress test
            </div>
            <div className="mt-3 space-y-2">
              <button
                onClick={() => setDemo({ mode: 'acquire', stage: 1 })}
                className="w-full rounded-lg border px-4 py-2.5 text-left text-slide-body font-medium transition hover:bg-gold/15"
                style={{
                  borderColor: `${GOLD}66`,
                  background: `${GOLD}10`,
                  color: GOLD,
                  boxShadow: `0 0 0 1px ${GOLD}22, 0 0 20px -6px ${GOLD}77`,
                }}
              >
                + Acquire a sales office
              </button>
              <button
                onClick={() => setDemo({ mode: 'divest', stage: 1 })}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-left text-slide-body text-mist transition hover:border-white/25 hover:text-paper"
              >
                – Divest an office
              </button>
            </div>

            <div className="mt-4 border-t border-white/10 pt-3">
              <div className="text-xs uppercase tracking-[0.18em] text-mist/70">
                Three docking contracts
              </div>
              <div className="mt-2 space-y-1.5">
                {CONTRACTS.map((c) => (
                  <div key={c.label} className="flex items-baseline gap-2 text-sm">
                    <span
                      className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full"
                      style={{ background: c.accent }}
                    />
                    <span className="font-medium text-paper/90">{c.label}</span>
                    <span className="text-xs text-mist">{c.desc}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-mist/70">
                Why 30 days is realistic: AI agents map their schemas to our
                canonical contracts and match customers &amp; products — weeks of
                mapping, not months of migration.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`${demo.mode}-${demo.stage}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border bg-navy-900/85 p-5 shadow-panel backdrop-blur-md"
            style={{
              borderColor: `${stage!.accent}44`,
              boxShadow: `0 0 0 1px ${stage!.accent}22, 0 0 28px -8px ${stage!.accent}66`,
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-xs uppercase tracking-[0.18em] text-mist">
                {demo.mode === 'acquire' ? 'Acquiring — Spain' : 'Divesting — Australia'}
              </span>
              <button
                onClick={() => setDemo(null)}
                className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-mist transition hover:text-paper"
              >
                ↺ Reset
              </button>
            </div>

            {/* stage timeline */}
            <div className="mt-3 flex gap-1.5">
              {stages.map((s, i) => {
                const reached = demo.stage >= i + 1;
                return (
                  <button
                    key={s.window}
                    onClick={() => setDemo({ mode: demo.mode, stage: i + 1 })}
                    className="flex-1 rounded-md border px-1.5 py-1 text-center font-mono text-[10px] uppercase tracking-[0.1em] transition"
                    style={{
                      borderColor: reached ? `${s.accent}55` : 'rgba(255,255,255,0.08)',
                      background: reached ? `${s.accent}12` : 'transparent',
                      color: reached ? s.accent : '#9DB4CC66',
                    }}
                  >
                    {s.window}
                  </button>
                );
              })}
            </div>

            <h3 className="mt-3 font-display text-xl text-paper">{stage!.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mist">{stage!.detail}</p>
            <p className="mt-2 text-xs leading-relaxed text-mist/70">
              <span className="uppercase tracking-[0.14em]" style={{ color: stage!.accent }}>
                Enabled by ·{' '}
              </span>
              {stage!.enabledBy}
            </p>

            {isLast && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-3 rounded-lg border px-3 py-2 text-center text-sm font-medium"
                style={{
                  borderColor: `${GOLD}55`,
                  background: `${GOLD}10`,
                  color: GOLD,
                }}
              >
                {demo.mode === 'acquire'
                  ? 'Docked in 90 days — no migration project.'
                  : 'Clean exit — nothing left behind in the core.'}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
