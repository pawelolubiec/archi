import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { systemById } from '../data/systems';
import { kpiById } from '../data/kpis';
import { FACTORY_DEMO_STEPS, DEMO_IMPACT_KPI_IDS } from '../data/factoryDemo';
import { AnimatedNumber } from './AnimatedNumber';

const GOLD = '#D6BF91';

/** Entry point hidden for now — flip to true to bring the demo back. */
const DEMO_ENABLED = false;

function DemoKpiRow({ kpiId }: { kpiId: string }) {
  const kpi = kpiById[kpiId];
  if (!kpi) return null;
  const max = Math.max(kpi.baseline, kpi.target);
  const baselinePct = (kpi.baseline / max) * 100;
  const targetPct = (kpi.target / max) * 100;

  return (
    <div className="mt-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-mist">{kpi.name}</span>
        <span className="font-mono text-xs text-paper/80">
          {kpi.baseline} →{' '}
          <span className="font-semibold text-sea">
            <AnimatedNumber value={kpi.target} />
          </span>{' '}
          {kpi.unit === '%' ? '%' : kpi.unit === 'days' ? 'days' : ''}
        </span>
      </div>
      <div className="relative mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full bg-sea"
          initial={{ width: `${baselinePct}%` }}
          animate={{ width: `${targetPct}%` }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
        <div
          className="absolute top-0 h-full w-px bg-paper/60"
          style={{ left: `${baselinePct}%` }}
        />
      </div>
    </div>
  );
}

function ImpactGrid() {
  return (
    <div className="mt-3 grid grid-cols-4 gap-2.5">
      {DEMO_IMPACT_KPI_IDS.map((kid, i) => {
        const kpi = kpiById[kid];
        if (!kpi) return null;
        return (
          <motion.div
            key={kid}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35 }}
            className="rounded-lg border border-white/10 bg-white/5 p-2.5"
          >
            <div className="text-[10px] uppercase tracking-[0.14em] text-mist">
              {kpi.name}
            </div>
            <div className="mt-1 font-display text-xl text-paper">
              <AnimatedNumber value={kpi.target} delay={i * 0.08} />
              <span className="ml-0.5 text-xs text-mist">
                {kpi.unit === 'index' ? '' : kpi.unit}
              </span>
            </div>
            <div className="text-[10px] text-mist/70">from {kpi.baseline}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

export function FactoryDemoPanel() {
  const step = useStore((s) => s.factoryDemoStep);
  const setStep = useStore((s) => s.setFactoryDemoStep);

  const demoStep = step !== null ? FACTORY_DEMO_STEPS[step] : null;
  const isLast = step === FACTORY_DEMO_STEPS.length - 1;

  if (!DEMO_ENABLED && step === null) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-24 z-40 flex justify-center px-6">
      <AnimatePresence mode="wait">
        {step === null ? (
          <motion.button
            key="enter"
            type="button"
            onClick={() => setStep(0)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="pointer-events-auto rounded-full border px-5 py-2.5 text-slide-body font-medium backdrop-blur-md transition hover:bg-gold/15"
            style={{
              borderColor: `${GOLD}66`,
              background: `${GOLD}10`,
              color: GOLD,
              boxShadow: `0 0 0 1px ${GOLD}22, 0 0 24px -6px ${GOLD}88`,
            }}
          >
            ▶ Go inside the factory — demo
          </motion.button>
        ) : (
          demoStep && (
            <motion.div
              key={demoStep.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-navy-900/85 p-5 shadow-panel backdrop-blur-md"
              style={{
                borderColor: `${GOLD}40`,
                boxShadow: `0 0 0 1px ${GOLD}22, 0 0 32px -8px ${GOLD}55`,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xs uppercase tracking-[0.18em] text-gold/90">
                  Step {step + 1} / {FACTORY_DEMO_STEPS.length} ·{' '}
                  {demoStep.kicker}
                </span>
                <button
                  onClick={() => setStep(null)}
                  className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-mist transition hover:text-paper"
                >
                  ✕ Exit demo
                </button>
              </div>

              <h3 className="mt-2 font-display text-xl text-paper lg:text-2xl">
                {demoStep.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mist lg:text-base">
                {demoStep.narrative}
              </p>

              {demoStep.systems.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {demoStep.systems.map((sid) => (
                    <span
                      key={sid}
                      className="rounded-md border border-sea/25 bg-sea/10 px-2 py-0.5 font-mono text-xs text-sea"
                    >
                      {systemById[sid]?.short ?? sid}
                    </span>
                  ))}
                </div>
              )}

              {demoStep.kpiId && <DemoKpiRow kpiId={demoStep.kpiId} />}
              {demoStep.id === 'impact' && <ImpactGrid />}

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setStep(step - 1)}
                  disabled={step === 0}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-sm text-mist transition enabled:hover:text-paper disabled:opacity-30"
                >
                  ← Back
                </button>

                <div className="flex items-center gap-1.5">
                  {FACTORY_DEMO_STEPS.map((s, i) => (
                    <button
                      key={s.id}
                      onClick={() => setStep(i)}
                      aria-label={s.kicker}
                      className="h-1.5 rounded-full transition-all"
                      style={{
                        width: i === step ? 18 : 6,
                        background:
                          i === step ? GOLD : 'rgba(255,255,255,0.25)',
                      }}
                    />
                  ))}
                </div>

                {isLast ? (
                  <button
                    onClick={() => setStep(null)}
                    className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-sm font-medium text-gold transition hover:bg-gold/20"
                  >
                    Exit — explore the factory
                  </button>
                ) : (
                  <button
                    onClick={() => setStep(step + 1)}
                    className="rounded-lg border border-sea/40 bg-sea/10 px-3 py-1.5 text-sm font-medium text-sea transition hover:bg-sea/20"
                  >
                    Next →
                  </button>
                )}
              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
