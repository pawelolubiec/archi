import { motion } from 'framer-motion';
import { roadmap } from '../data/scenarios';

export function RoadmapTimeline() {
  return (
    <div className="pointer-events-auto w-full max-w-[min(90vw,1680px)]">
      <div className="relative grid grid-cols-5 gap-2 lg:gap-3">
        {/* background value line */}
        <svg
          className="pointer-events-none absolute inset-x-0 -top-2 h-24 w-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 30"
        >
          <polyline
            points={roadmap
              .map((p, i) => `${(i / (roadmap.length - 1)) * 100},${30 - p.valueIndex * 28}`)
              .join(' ')}
            fill="none"
            stroke="#D6BF91"
            strokeWidth="0.6"
            opacity="0.5"
          />
        </svg>

        {roadmap.map((phase, i) => (
          <motion.div
            key={phase.year}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="slide-card min-w-0 p-4 lg:p-5"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-2xl text-gold lg:text-3xl">{phase.year}</span>
              <span className="text-slide-caption uppercase tracking-[0.14em] text-sea">
                {phase.theme}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sea to-green"
                style={{ width: `${phase.valueIndex * 100}%` }}
              />
            </div>
            <ul className="mt-3 space-y-1.5">
              {phase.items.map((it) => (
                <li key={it} className="flex items-center gap-2 text-slide-body text-paper/90">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sea" />
                  {it}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      <p className="mt-5 text-center text-base text-mist">
        Business value accumulates with every phase — a sequence, not a big bang.
      </p>
    </div>
  );
}
