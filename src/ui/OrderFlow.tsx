import { motion } from 'framer-motion';
import { kpiById } from '../data/kpis';

const STEP_STAGGER_MS = 400;

const STEPS = [
  {
    title: 'Customer order',
    description: 'captured once in MiFo at the sales office',
  },
  {
    title: 'Demand signal',
    description: 'forecast, prices, specs and requirements attached automatically',
  },
  {
    title: 'Production plan',
    description: 'APS / PTS receive it the same day, no re-keying',
  },
  {
    title: 'Promise kept',
    description: 'delivery date confirmed back to the customer from the real plan',
  },
] as const;

const CONTRAST_DELAY = STEPS.length * (STEP_STAGGER_MS / 1000);

export function OrderFlow() {
  const inventory = kpiById.inventory_days;

  return (
    <div className="pointer-events-none w-full max-w-3xl">
      <div className="flex items-start gap-2 sm:gap-3">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex min-w-0 flex-1 items-start">
            <motion.div
              className="min-w-0 flex-1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: i * (STEP_STAGGER_MS / 1000),
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="rounded-xl border border-white/10 bg-navy-900/70 p-4 backdrop-blur-md">
                <div className="text-base font-semibold text-paper lg:text-lg">
                  {step.title}
                </div>
                <p className="mt-2 text-sm leading-snug text-mist lg:text-base">
                  {step.description}
                </p>
              </div>
            </motion.div>
            {i < STEPS.length - 1 && (
              <motion.span
                className="mt-5 shrink-0 px-0.5 text-gold/60 sm:px-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.3,
                  delay: i * (STEP_STAGGER_MS / 1000) + 0.2,
                }}
                aria-hidden
              >
                →
              </motion.span>
            )}
          </div>
        ))}
      </div>

      <motion.div
        className="mt-5 space-y-2 rounded-xl border border-white/10 bg-navy-900/60 p-4 backdrop-blur-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: CONTRAST_DELAY,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-slide-body">
          <span className="font-mono text-slide-caption uppercase tracking-[0.18em] text-mist">
            Today
          </span>
          <span className="text-paper/70">
            e-mail and re-keying · 2–3 days late · conflicting versions
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-slide-body">
          <span className="font-mono text-slide-caption uppercase tracking-[0.18em] text-sea">
            Target
          </span>
          <span className="text-paper/90">
            automatic · same day · one version of the truth
          </span>
        </div>
      </motion.div>

      <motion.p
        className="mt-4 max-w-2xl text-slide-body leading-relaxed text-mist"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.45,
          delay: CONTRAST_DELAY + 0.25,
        }}
      >
        Late demand signals cost margin every shift and hold {inventory.baseline}{' '}
        days of inventory. Same-day flow is what carries the {inventory.baseline} →{' '}
        {inventory.target} days target.
      </motion.p>
    </div>
  );
}
