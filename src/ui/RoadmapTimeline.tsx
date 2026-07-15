import { useState } from 'react';
import { motion } from 'framer-motion';
import { ROADMAP_TRACKS, ROADMAP_ENABLERS, scenarioById } from '../data/scenarios';

type Pace = 'standard' | 'accelerated';

const AXIS_START = 2026;
const AXIS_END = 2031;
const YEARS = [2026, 2027, 2028, 2029, 2030];
/** Today marker — Jul 2026 */
const TODAY_MARKER = 2026.5;
/** ERP go-live deadline — Dec 2028 */
const ERP_LIVE_MARKER = 2028.9;

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
    <div className="pointer-events-auto flex h-full max-h-[40rem] w-full max-w-[100rem] flex-col">
      {/* pace toggle */}
      <div className="flex shrink-0 items-center justify-between gap-4">
        <span className="font-mono text-[clamp(10px,0.65vw,13px)] uppercase tracking-[0.18em] text-mist">
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
                className="rounded-full border px-[clamp(0.75rem,1.1vw,1.25rem)] py-[clamp(0.3rem,0.55vh,0.5rem)] text-[clamp(11px,0.7vw,14px)] font-medium transition"
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
      <div className="mt-[clamp(0.45rem,1vh,0.75rem)] flex min-h-0 flex-1 rounded-xl border border-white/10 bg-navy-900/60 px-[clamp(0.75rem,1.2vw,1.25rem)] py-[clamp(0.55rem,1vh,0.85rem)] backdrop-blur-sm">
        {/* theme labels */}
        <div className="flex h-full w-[clamp(11rem,15vw,17rem)] shrink-0 flex-col pr-[clamp(0.75rem,1.2vw,1.25rem)]">
          <div className="h-[clamp(1.5rem,3vh,2rem)]" />
          {ROADMAP_TRACKS.map((t) => (
            <div
              key={t.theme}
              className="flex min-h-[2.75rem] flex-1 flex-col justify-center"
            >
              <div className="text-[clamp(12px,0.8vw,16px)] font-semibold leading-tight text-paper">
                {t.theme}
              </div>
              <div
                className="truncate text-[clamp(10px,0.62vw,13px)] leading-tight text-mist/70"
                title={t.items.join(' · ')}
              >
                {t.items.join(' · ')}
              </div>
            </div>
          ))}
        </div>

        {/* track area */}
        <div className="relative flex h-full min-w-0 flex-1 flex-col">
          {/* year axis */}
          <div className="relative h-[clamp(1.5rem,3vh,2rem)]">
            {YEARS.map((y) => (
              <span
                key={y}
                className="absolute -translate-x-1/2 font-mono text-[clamp(10px,0.62vw,13px)] text-mist/60"
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
              className="absolute bottom-0 top-[clamp(1.5rem,3vh,2rem)] w-px bg-white/5"
              style={{ left: `${pct(y)}%` }}
            />
          ))}

          {/* Today marker */}
          <div
            className="pointer-events-none absolute bottom-0 top-[clamp(1.25rem,2.5vh,1.75rem)]"
            style={{ left: `${pct(TODAY_MARKER)}%` }}
          >
            <div className="h-full w-px bg-sea/70" />
            <span className="absolute -top-0.5 left-1.5 whitespace-nowrap font-mono text-[clamp(9px,0.55vw,11px)] uppercase tracking-[0.14em] text-sea">
              Today · Jul 2026
            </span>
          </div>

          {/* ERP go-live marker */}
          <div
            className="pointer-events-none absolute bottom-0 top-[clamp(1.25rem,2.5vh,1.75rem)]"
            style={{ left: `${pct(ERP_LIVE_MARKER)}%` }}
          >
            <div className="h-full w-px border-l border-dashed border-gold/80" />
            <span className="absolute left-1.5 top-4 whitespace-nowrap font-mono text-[clamp(9px,0.55vw,11px)] uppercase tracking-[0.14em] text-gold">
              ERP live · Dec 2028
            </span>
          </div>

          {/* accelerated landing marker */}
          <motion.div
            className="pointer-events-none absolute bottom-0 top-[clamp(1.25rem,2.5vh,1.75rem)]"
            initial={false}
            animate={{ opacity: accelerated ? 1 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ left: `${pct(2029.0)}%` }}
          >
            <div className="h-full w-px border-l border-dashed border-gold/60" />
            <span className="absolute -top-0.5 left-1.5 whitespace-nowrap font-mono text-[clamp(9px,0.55vw,11px)] uppercase tracking-[0.14em] text-gold/90">
              2030 scope · end-2028
            </span>
          </motion.div>

          {/* cumulative value curves */}
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 top-[clamp(1.5rem,3vh,2rem)] w-full overflow-hidden"
            style={{ height: 'calc(100% - clamp(1.5rem, 3vh, 2rem))' }}
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
              <div
                key={t.theme}
                className="relative min-h-[2.75rem] flex-1"
              >
                <motion.div
                  className="absolute top-1/2 h-[clamp(1.15rem,2.3vh,1.75rem)] -translate-y-1/2 rounded-full"
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
      <div className="mt-[clamp(0.4rem,0.9vh,0.7rem)] flex shrink-0 flex-wrap items-center gap-1.5">
        <span className="mr-1 font-mono text-[clamp(9px,0.58vw,12px)] uppercase tracking-[0.18em] text-mist/60">
          What makes it faster
        </span>
        {ROADMAP_ENABLERS.map((e) => (
          <span
            key={e}
            className="rounded-full border px-[clamp(0.5rem,0.75vw,0.75rem)] py-0.5 text-[clamp(9px,0.58vw,12px)] transition-colors"
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
      <p className="mt-[clamp(0.35rem,0.8vh,0.6rem)] shrink-0 text-center text-[clamp(10px,0.62vw,13px)] text-mist/80">
        {accelerated
          ? `Two years earlier ≈ €${(ebitdaM * 2).toFixed(1)}M cumulative EBITDA pulled forward (reference estimate — validate with Controlling).`
          : `Full run-rate is +€${ebitdaM.toFixed(1)}M EBITDA / year — every year earlier pulls that value forward.`}
      </p>
    </div>
  );
}
