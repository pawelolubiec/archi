import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { systemById } from '../data/systems';
import { kpiById } from '../data/kpis';
import { ACCENT_HEX } from '../data/brand';
import {
  FACTORY_TOUR_ORDER,
  TOUR_NARRATIVE,
  tourCameraFor,
} from '../data/factoryTour';

const AUTO_START_MS = 2600;

type Phase = 'intro' | 'tour' | 'done';

export function FactoryTourPanel() {
  const chapter = useStore((s) => s.current());
  const mapping = useStore((s) => s.factoryMapping);
  const setFactoryTour = useStore((s) => s.setFactoryTour);
  const openApp = useStore((s) => s.openApp);
  const demoActive = useStore((s) => s.factoryDemoStep !== null);

  const [phase, setPhase] = useState<Phase>('intro');
  const [step, setStep] = useState(0);

  // the "go inside" demo takes over the scene — stand down, don't auto-start
  useEffect(() => {
    if (demoActive) setPhase('done');
  }, [demoActive]);

  const tourSystems = useMemo(
    () =>
      FACTORY_TOUR_ORDER.filter(
        (id) =>
          chapter.activeSystems.includes(id) &&
          (mapping[id]?.length ?? 0) > 0,
      ),
    [chapter.activeSystems, mapping],
  );

  const goTo = useCallback(
    (i: number) => {
      const id = tourSystems[i];
      if (!id) return;
      setStep(i);
      setPhase('tour');
      setFactoryTour(id, tourCameraFor(id, mapping));
    },
    [tourSystems, mapping, setFactoryTour],
  );

  const finish = useCallback(() => {
    setPhase('done');
    setFactoryTour(null, null);
  }, [setFactoryTour]);

  // start the run-through automatically once the hall has risen
  useEffect(() => {
    if (phase !== 'intro' || !tourSystems.length) return;
    const t = setTimeout(() => goTo(0), AUTO_START_MS);
    return () => clearTimeout(t);
  }, [phase, tourSystems, goTo]);

  if (!tourSystems.length || demoActive) return null;

  const sys = phase === 'tour' ? systemById[tourSystems[step]] : null;
  const accent = sys ? ACCENT_HEX[sys.accent] : undefined;
  const isLast = step === tourSystems.length - 1;

  return (
    <div className="pointer-events-auto w-[400px]">
      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.button
            key="intro"
            type="button"
            onClick={() => goTo(0)}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, delay: 1.2 }}
            className="rounded-full border border-gold/40 bg-ink/80 px-4 py-2 text-slide-body font-medium text-gold backdrop-blur-md transition hover:bg-gold/10"
          >
            ▶ Run through the systems
          </motion.button>
        )}

        {phase === 'tour' && sys && (
          <motion.div
            key={sys.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl border border-white/10 bg-navy-900/85 p-5 shadow-panel backdrop-blur-md"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-slide-caption uppercase tracking-[0.18em] text-mist">
                System {step + 1} / {tourSystems.length}
              </span>
              <button
                onClick={finish}
                className="text-slide-caption text-mist transition hover:text-paper"
              >
                Skip — explore freely
              </button>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2.5">
              <span
                className="font-display text-2xl"
                style={{ color: accent }}
              >
                {sys.short}
              </span>
              <span className="text-slide-body text-paper">{sys.name}</span>
            </div>
            <div className="mt-0.5 text-slide-caption text-mist">
              Owner: {sys.owner}
            </div>

            <p className="mt-3 text-slide-body leading-relaxed text-paper/90">
              {TOUR_NARRATIVE[sys.id] ?? sys.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {sys.businessKPIs.map((kid) => (
                <span
                  key={kid}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-slide-caption text-sea"
                >
                  {kpiById[kid]?.name ?? kid}
                </span>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => goTo(step - 1)}
                disabled={step === 0}
                className="rounded-lg border border-white/10 px-3 py-1.5 text-slide-body text-mist transition enabled:hover:text-paper disabled:opacity-30"
              >
                ← Back
              </button>

              <div className="flex items-center gap-1.5">
                {tourSystems.map((id, i) => (
                  <button
                    key={id}
                    onClick={() => goTo(i)}
                    aria-label={systemById[id].short}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === step ? 18 : 6,
                      background:
                        i === step ? '#D6BF91' : 'rgba(255,255,255,0.25)',
                    }}
                  />
                ))}
              </div>

              {isLast ? (
                <button
                  onClick={finish}
                  className="rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-slide-body font-medium text-gold transition hover:bg-gold/20"
                >
                  Finish — explore ↗
                </button>
              ) : (
                <button
                  onClick={() => goTo(step + 1)}
                  className="rounded-lg border border-sea/40 bg-sea/10 px-3 py-1.5 text-slide-body font-medium text-sea transition hover:bg-sea/20"
                >
                  Next →
                </button>
              )}
            </div>

            <button
              onClick={() => openApp(sys.id)}
              className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-slide-caption text-mist transition hover:border-sea/40 hover:text-sea"
            >
              View app — screenshot ↗
            </button>
          </motion.div>
        )}

        {phase === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="flex items-center gap-3 rounded-2xl border border-white/10 bg-navy-900/80 px-4 py-3 backdrop-blur-md"
          >
            <p className="min-w-0 flex-1 text-slide-caption leading-relaxed text-mist">
              <span className="font-medium text-paper">Explore freely</span> —
              drag to orbit · scroll to zoom · click a system chip to open the
              app.
            </p>
            <button
              onClick={() => goTo(0)}
              className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-slide-caption uppercase tracking-[0.14em] text-mist transition hover:border-white/25 hover:text-paper"
            >
              ↺ Tour
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
