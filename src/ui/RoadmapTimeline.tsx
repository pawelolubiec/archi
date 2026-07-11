import { useState } from 'react';
import { motion } from 'framer-motion';
import { ROADMAP_TRACKS, ROADMAP_ENABLERS, scenarioById } from '../data/scenarios';

type Pace = 'standard' | 'accelerated';

const AXIS_START = 2026;
const AXIS_END = 2031;
const YEARS = [2026, 2027, 2028, 2029, 2030];
/** end-2028 boundary — where the accelerated scope lands */
const ACCEL_LANDING = 2029.0;

const PACE: Record<Pace, { label: string; accent: string; gradient: string }> = {
  standard: {
    label: 'Standard 2026–2030',
    accent: '#2EC5C5',
    gradient: 'linear-gradient(90deg, rgba(46,197,197,0.85), rgba(52,211,153,0.9))',
  },
  accelerated: {
    label: 'Accelerated → end-2028',
    accent: '#D6BF91',
    gradient: 'linear-gradient(90deg, rgba(214,191,145,0.9), rgba(52,211,153,0.9))',
  },
};

const pct = (year: number) =>
  ((year - AXIS_START) / (AXIS_END - AXIS_START)) * 100;

/** Cumulative-value curves (fractional year, 0..1 value). */
const VALUE_CURVES: Record<Pace, Array<[number, number]>> = {
  standard: [
    [2026, 0],
    [2027, 0.15],
    [2028, 0.38],
    [2029, 0.6],
    [2030, 0.82],
    [2030.9, 1],
  ],
  accelerated: [
    [2026, 0],
    [2026.7, 0.18],
    [2027.5, 0.42],
    [2028.1, 0.65],
    [2028.7, 0.88],
    [2029.0, 1],
  ],
};

function curvePoints(pace: Pace): string {
  return VALUE_CURVES[pace]
    .map(([year, v]) => `${pct(year)},${(1 - v) * 96 + 2}`)
    .join(' ');
}

export function RoadmapTimeline() {
  const [pace, setPace] = useState<Pace>('standard');
  const accelerated = pace === 'accelerated';
  const ebitdaM = scenarioById.transformacja_2030.ebitdaAnnualK / 1000;
  const accent = PACE[pace].accent;

  return (
    <div className="pointer-events-auto w-full max-w-6xl">
      {/* pace toggle */}
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-slide-caption uppercase tracking-[0.18em] text-mist">
          Delivery pace
        </span>
        <div className="flex gap-2">
          {(Object.keys(PACE) as Pace[]).map((p) => {
            const selected = pace === p;
            const meta = PACE[p];
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPace(p)}
                className="rounded-full border px-4 py-1.5 text-sm font-medium transition"
                style={{
                  borderColor: selected ? `${meta.accent}cc` : 'rgba(255,255,255,0.1)',
                  background: selected ? `${meta.accent}14` : 'transparent',
                  color: selected ? meta.accent : '#9DB4CC',
                  boxShadow: selected
                    ? `0 0 0 1px ${meta.accent}40, 0 0 18px -4px ${meta.accent}80`
                    : undefined,
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* parallel track chart */}
      <div className="mt-2.5 flex rounded-xl border border-white/10 bg-navy-900/60 px-4 py-3 backdrop-blur-sm">
        {/* theme labels */}
        <div className="w-52 shrink-0 pr-4">
          <div className="h-6" />
          {ROADMAP_TRACKS.map((t) => (
            <div key={t.theme} className="flex h-12 flex-col justify-center">
              <div className="text-sm font-semibold leading-tight text-paper">
                {t.theme}
              </div>
              <div
                className="truncate text-xs leading-tight text-mist/70"
                title={t.items.join(' · ')}
              >
                {t.items.join(' · ')}
              </div>
            </div>
          ))}
        </div>

        {/* track area */}
        <div className="relative min-w-0 flex-1">
          {/* year axis */}
          <div className="relative h-6">
            {YEARS.map((y) => (
              <span
                key={y}
                className="absolute -translate-x-1/2 font-mono text-xs text-mist/60"
                style={{ left: `${pct(y)}%` }}
              >
                {y}
              </span>
            ))}
          </div>

          {/* gridlines */}
          {YEARS.map((y) => (
            <div
              key={y}
              className="absolute bottom-0 top-6 w-px bg-white/5"
              style={{ left: `${pct(y)}%` }}
            />
          ))}

          {/* accelerated landing marker */}
          <motion.div
            className="pointer-events-none absolute bottom-0 top-5"
            initial={false}
            animate={{ opacity: accelerated ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ left: `${pct(ACCEL_LANDING)}%` }}
          >
            <div className="h-full w-px border-l border-dashed border-gold/60" />
            <span className="absolute -top-0.5 left-1.5 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-gold/90">
              2030 scope · end-2028
            </span>
          </motion.div>

          {/* cumulative value curves */}
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 top-6 h-[calc(100%-1.5rem)] w-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <polyline
              points={curvePoints('standard')}
              fill="none"
              stroke="#2EC5C5"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              opacity={accelerated ? 0.18 : 0.55}
              style={{ transition: 'opacity 0.3s' }}
            />
            <polyline
              points={curvePoints('accelerated')}
              fill="none"
              stroke="#D6BF91"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              opacity={accelerated ? 0.6 : 0.18}
              style={{ transition: 'opacity 0.3s' }}
            />
          </svg>

          {/* track bars */}
          {ROADMAP_TRACKS.map((t, i) => {
            const span = t[pace];
            return (
              <div key={t.theme} className="relative h-12">
                <motion.div
                  className="absolute top-1/2 h-5 -translate-y-1/2 rounded-full"
                  initial={false}
                  animate={{
                    left: `${pct(span.start)}%`,
                    width: `${pct(span.end) - pct(span.start)}%`,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.05,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{
                    background: PACE[pace].gradient,
                    boxShadow: `0 0 0 1px ${accent}33, 0 0 14px -3px ${accent}99`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* enablers */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-xs uppercase tracking-[0.18em] text-mist/60">
          What makes it faster
        </span>
        {ROADMAP_ENABLERS.map((e) => (
          <span
            key={e}
            className="rounded-full border px-2.5 py-0.5 text-xs transition-colors"
            style={{
              borderColor: accelerated ? '#D6BF9155' : 'rgba(255,255,255,0.1)',
              background: accelerated ? '#D6BF9112' : 'transparent',
              color: accelerated ? '#D6BF91' : '#9DB4CC99',
            }}
          >
            {e}
          </span>
        ))}
      </div>

      {/* money line */}
      <p className="mt-2 text-center text-xs text-mist/80">
        {accelerated
          ? `Two years earlier ≈ €${(ebitdaM * 2).toFixed(1)}M cumulative EBITDA pulled forward (reference estimate — validate with Controlling).`
          : `Full run-rate is +€${ebitdaM.toFixed(1)}M EBITDA / year — every year earlier pulls that value forward.`}
      </p>
    </div>
  );
}
