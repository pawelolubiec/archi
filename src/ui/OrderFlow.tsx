import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { kpiById } from '../data/kpis';

type FlowMode = 'target' | 'today';

const AUTOPLAY_MS = 1400;

const STEPS = [
  {
    title: 'Customer order',
    system: 'MiFo',
    variants: {
      target: {
        detail: 'Captured once in MiFo at the sales office.',
        time: 'Hour 0',
      },
      today: {
        detail: 'Typed into e-mail and a local spreadsheet.',
        time: 'Day 0',
      },
    },
  },
  {
    title: 'Demand signal',
    system: 'MiFo → APS',
    variants: {
      target: {
        detail: 'Forecast, prices and specs attached automatically.',
        time: 'Same hour',
      },
      today: {
        detail: 'Re-keyed by hand; specs chased by e-mail.',
        time: 'Day 1',
      },
    },
  },
  {
    title: 'Production plan',
    system: 'APS / PTS',
    variants: {
      target: {
        detail: 'APS / PTS receive it the same day, no re-keying.',
        time: 'Same day',
      },
      today: {
        detail: 'Plan built against stale numbers and conflicting versions.',
        time: 'Day 2–3',
      },
    },
  },
  {
    title: 'Promise kept',
    system: 'MiFo',
    variants: {
      target: {
        detail: 'Delivery date confirmed from the real plan.',
        time: 'Same day',
      },
      today: {
        detail: 'Date guessed at quote time, corrected after the fact.',
        time: 'Day 3+',
      },
    },
  },
] as const;

/** The return leg of the loop: real production cost flowing back to sales. */
const FEEDBACK = {
  title: 'Margin truth — real cost back to sales',
  system: 'PTS / PID → MiFo',
  variants: {
    target: {
      detail:
        'Yield, giveaway and labor per order flow back into MiFo the same day — every new quote knows the real margin of the last one, so we learn what is best for us to sell.',
      time: 'Same day',
    },
    today: {
      detail:
        'Real cost surfaces weeks later at month-end close — we quote without knowing which products or customers actually make money.',
      time: 'Weeks later',
    },
  },
} as const;

const MODES: Record<
  FlowMode,
  { label: string; summary: string; accent: string; barPct: number; barLabel: string }
> = {
  today: {
    label: 'Today',
    summary: 'e-mail and re-keying · margin known at month-end',
    accent: '#ff9d9d',
    barPct: 100,
    barLabel: '2–3 days',
  },
  target: {
    label: 'Target',
    summary: 'automatic · real margin on every order',
    accent: '#2EC5C5',
    barPct: 16,
    barLabel: 'same day',
  },
};

export function OrderFlow() {
  const inventory = kpiById.inventory_days;
  const [mode, setMode] = useState<FlowMode>('target');
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);

  // The feedback (return) leg is the last stop of the journey.
  const FEEDBACK_INDEX = STEPS.length;

  useEffect(() => {
    if (!playing) return;
    if (active >= FEEDBACK_INDEX) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setActive((a) => a + 1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [playing, active, FEEDBACK_INDEX]);

  const accent = MODES[mode].accent;
  const feedbackActive = active === FEEDBACK_INDEX;
  const feedbackVariant = FEEDBACK.variants[mode];

  return (
    <div className="pointer-events-auto w-full max-w-3xl">
      <div className="flex items-start gap-2 sm:gap-3">
        {STEPS.map((step, i) => {
          const isActive = i === active;
          const reached = i <= active;
          const variant = step.variants[mode];

          return (
            <div key={step.title} className="flex min-w-0 flex-1 items-start">
              <motion.button
                type="button"
                onClick={() => {
                  setActive(i);
                  setPlaying(false);
                }}
                className={`min-w-0 flex-1 rounded-xl border p-3 text-left backdrop-blur-md transition-colors ${
                  reached
                    ? 'border-white/10 bg-navy-900/70'
                    : 'border-white/5 bg-navy-900/40'
                }`}
                initial={{ opacity: 0, y: 16 }}
                animate={{
                  opacity: reached ? 1 : 0.45,
                  y: 0,
                }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                style={
                  isActive
                    ? {
                        borderColor: `${accent}cc`,
                        boxShadow: `0 0 0 1px ${accent}55, 0 0 14px -2px ${accent}99, 0 0 38px -6px ${accent}66`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-2">
                  <span
                    className="font-mono text-slide-caption"
                    style={{ color: reached ? accent : '#9DB4CC' }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-base font-semibold text-paper">
                    {step.title}
                  </span>
                </div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={`${mode}-detail`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mt-2 text-sm leading-snug text-mist"
                  >
                    {variant.detail}
                  </motion.p>
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-md border border-sea/25 bg-sea/10 px-2 py-0.5 font-mono text-slide-caption text-sea">
                          {step.system}
                        </span>
                        <span
                          className="rounded-md border px-2 py-0.5 font-mono text-slide-caption"
                          style={{
                            borderColor: `${accent}40`,
                            background: `${accent}14`,
                            color: accent,
                          }}
                        >
                          {variant.time}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
              {i < STEPS.length - 1 && (
                <motion.span
                  className="mt-5 shrink-0 px-0.5 sm:px-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ color: i < active ? accent : 'rgba(255,255,255,0.2)' }}
                  aria-hidden
                >
                  →
                </motion.span>
              )}
            </div>
          );
        })}
      </div>

      <motion.button
        type="button"
        onClick={() => {
          setActive(FEEDBACK_INDEX);
          setPlaying(false);
        }}
        className={`mt-2.5 block w-full rounded-xl border p-3 text-left backdrop-blur-md transition-colors ${
          feedbackActive
            ? 'border-white/10 bg-navy-900/70'
            : 'border-white/5 bg-navy-900/40'
        }`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: feedbackActive ? 1 : 0.5, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={
          feedbackActive
            ? {
                borderColor: '#D6BF91cc',
                boxShadow:
                  '0 0 0 1px #D6BF9155, 0 0 14px -2px #D6BF9199, 0 0 38px -6px #D6BF9166',
              }
            : undefined
        }
      >
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-slide-caption"
            style={{ color: feedbackActive ? '#D6BF91' : '#9DB4CC' }}
          >
            05
          </span>
          <span className="text-base font-semibold text-paper">
            {FEEDBACK.title}
          </span>
          <span className="ml-auto shrink-0 text-gold/70" aria-hidden>
            ↩
          </span>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`${mode}-feedback`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mt-1.5 text-sm leading-snug text-mist"
          >
            {feedbackVariant.detail}
          </motion.p>
        </AnimatePresence>
        <AnimatePresence initial={false}>
          {feedbackActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <span className="rounded-md border border-gold/25 bg-gold/10 px-2 py-0.5 font-mono text-slide-caption text-gold/90">
                  {FEEDBACK.system}
                </span>
                <span
                  className="rounded-md border px-2 py-0.5 font-mono text-slide-caption"
                  style={{
                    borderColor: `${accent}40`,
                    background: `${accent}14`,
                    color: accent,
                  }}
                >
                  {feedbackVariant.time}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <motion.div
        className="mt-4 space-y-1.5 rounded-xl border border-white/10 bg-navy-900/60 p-2.5 backdrop-blur-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {(Object.keys(MODES) as FlowMode[]).map((m) => {
          const meta = MODES[m];
          const selected = mode === m;
          return (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`block w-full rounded-lg border px-3 py-1.5 text-left transition-colors ${
                selected
                  ? 'border-white/15 bg-white/5'
                  : 'border-transparent opacity-55 hover:opacity-85'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-14 shrink-0 font-mono text-slide-caption uppercase tracking-[0.18em]"
                  style={{ color: meta.accent }}
                >
                  {meta.label}
                </span>
                <span
                  className={`min-w-0 flex-1 text-slide-body leading-snug ${
                    selected ? 'text-paper/90' : 'text-paper/70'
                  }`}
                >
                  {meta.summary}
                </span>
                <div className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full"
                    initial={false}
                    animate={{ width: `${meta.barPct}%` }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    style={{ background: meta.accent }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right font-mono text-slide-caption text-mist">
                  {meta.barLabel}
                </span>
              </div>
            </button>
          );
        })}
      </motion.div>

      <motion.div
        className="mt-2.5 flex items-start gap-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, delay: 0.65 }}
      >
        <p className="min-w-0 flex-1 text-slide-caption leading-relaxed text-mist">
          Late demand signals cost margin every shift and hold {inventory.baseline}{' '}
          days of inventory. Same-day flow is what carries the {inventory.baseline} →{' '}
          {inventory.target} days target.
        </p>
        <button
          onClick={() => {
            setActive(0);
            setPlaying(true);
          }}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-slide-caption uppercase tracking-[0.14em] text-mist transition hover:border-white/25 hover:text-paper"
        >
          ↺ Replay
        </button>
      </motion.div>
    </div>
  );
}
