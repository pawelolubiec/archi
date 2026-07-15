import { motion } from 'framer-motion';

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

export function GrowthPanel() {
  return (
    <div className="pointer-events-auto w-[min(40rem,64vw)] rounded-2xl border border-white/10 bg-navy-900/85 p-6 shadow-panel backdrop-blur-md">
        <div className="font-display text-2xl text-paper lg:text-3xl">
          Hybrid architecture — why it works
        </div>
        <ul className="mt-5 grid grid-cols-2 gap-x-7 gap-y-5">
          {HYBRID_BENEFITS.map((b, i) => (
            <motion.li
              key={b.title}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className={i === HYBRID_BENEFITS.length - 1 ? 'col-span-2 max-w-xl' : ''}
            >
              <div className="text-lg font-medium text-paper">{b.title}</div>
              <div className="mt-1 text-sm leading-relaxed text-mist/80">{b.detail}</div>
            </motion.li>
          ))}
        </ul>
    </div>
  );
}
