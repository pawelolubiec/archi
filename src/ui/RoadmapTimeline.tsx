import { motion } from 'framer-motion';
import {
  ROADMAP_FOOTNOTES,
  ROADMAP_INITIATIVES,
  ROADMAP_LEGEND,
  ROADMAP_PHASE_COLORS,
  ROADMAP_TOTALS,
  ROADMAP_YEARS,
  type CostValue,
  type RoadmapPhase,
  type RoadmapPhaseKind,
} from '../data/roadmap';

const COST_COLS =
  'minmax(12rem, 1.55fr) minmax(5.5rem, 0.55fr) minmax(6rem, 0.6fr) minmax(5.5rem, 0.55fr)';
const YEAR_COLS = `repeat(${ROADMAP_YEARS.length}, minmax(0, 1fr))`;
const TABLE_COLS = `${COST_COLS} minmax(16rem, 2.2fr)`;

function formatCost(value: CostValue): { text: string; italic?: boolean } {
  if (value === null) return { text: '–' };
  if (value === 'internal') return { text: 'internal', italic: true };
  return { text: value.toLocaleString('en-US') };
}

function CostCell({
  value,
  align = 'right',
  muted = false,
}: {
  value: CostValue;
  align?: 'left' | 'right';
  muted?: boolean;
}) {
  const { text, italic } = formatCost(value);
  return (
    <span
      className={`block tabular-nums ${align === 'right' ? 'text-right' : 'text-left'} ${
        italic ? 'italic text-mist/80' : muted ? 'text-mist/70' : 'text-paper'
      }`}
    >
      {text}
    </span>
  );
}

/** Clip each phase to a single calendar year and return fill segments for that cell. */
function yearSegments(year: number, phases: RoadmapPhase[]) {
  const yearStart = year;
  const yearEnd = year + 1;
  const segments: Array<{ kind: RoadmapPhaseKind; left: string; width: string }> = [];

  for (const phase of phases) {
    const start = Math.max(phase.start, yearStart);
    const end = Math.min(phase.end, yearEnd);
    if (end <= start) continue;
    segments.push({
      kind: phase.kind,
      left: `${((start - yearStart) / 1) * 100}%`,
      width: `${((end - start) / 1) * 100}%`,
    });
  }

  return segments;
}

function TimelineTrack({ phases }: { phases: RoadmapPhase[] }) {
  return (
    <div
      className="grid h-full min-h-[1.35rem] flex-1 gap-px"
      style={{ gridTemplateColumns: YEAR_COLS }}
    >
      {ROADMAP_YEARS.map((year) => (
        <div key={year} className="relative h-full overflow-hidden">
          {yearSegments(year, phases).map((seg, i) => (
            <div
              key={`${year}-${seg.kind}-${i}`}
              className="absolute inset-y-[18%] rounded-[1px]"
              style={{
                left: seg.left,
                width: seg.width,
                background: ROADMAP_PHASE_COLORS[seg.kind],
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function RoadmapTimeline() {
  return (
    <div className="pointer-events-auto flex h-full max-h-[min(42rem,100%)] w-full max-w-[100rem] flex-col">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-white/10 bg-navy-900/65 shadow-panel backdrop-blur-sm">
        {/* header */}
        <div
          className="grid shrink-0 items-end gap-x-[clamp(0.4rem,0.7vw,0.75rem)] border-b border-white/10 bg-navy-800/90 px-[clamp(0.55rem,0.9vw,0.9rem)] py-[clamp(0.4rem,0.75vh,0.6rem)]"
          style={{ gridTemplateColumns: TABLE_COLS }}
        >
          <span className="text-[clamp(9px,0.55vw,11px)] font-semibold uppercase tracking-[0.12em] text-mist/70">
            Initiative / project
          </span>
          <span className="text-right text-[clamp(8px,0.5vw,10px)] font-semibold uppercase leading-tight tracking-[0.1em] text-mist/70">
            Current cost
            <span className="mt-0.5 block font-normal normal-case tracking-normal text-mist/45">
              EUR &apos;000 / yr
            </span>
          </span>
          <span className="text-right text-[clamp(8px,0.5vw,10px)] font-semibold uppercase leading-tight tracking-[0.1em] text-mist/70">
            Transformation
            <span className="mt-0.5 block font-normal normal-case tracking-normal text-mist/45">
              EUR &apos;000 one-off
            </span>
          </span>
          <span className="text-right text-[clamp(8px,0.5vw,10px)] font-semibold uppercase leading-tight tracking-[0.1em] text-mist/70">
            Future maint.
            <span className="mt-0.5 block font-normal normal-case tracking-normal text-mist/45">
              EUR &apos;000 / yr
            </span>
          </span>
          <div
            className="grid text-center text-[clamp(9px,0.55vw,11px)] font-semibold tabular-nums text-mist/80"
            style={{ gridTemplateColumns: YEAR_COLS }}
          >
            {ROADMAP_YEARS.map((year) => (
              <span key={year}>{year}</span>
            ))}
          </div>
        </div>

        {/* rows */}
        <div className="flex min-h-0 flex-1 flex-col">
          {ROADMAP_INITIATIVES.map((row, index) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.04,
                duration: 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`grid min-h-0 flex-1 items-center gap-x-[clamp(0.4rem,0.7vw,0.75rem)] border-b border-white/5 px-[clamp(0.55rem,0.9vw,0.9rem)] ${
                index % 2 === 0 ? 'bg-white/[0.02]' : 'bg-white/[0.045]'
              }`}
              style={{ gridTemplateColumns: TABLE_COLS }}
            >
              <span className="truncate text-[clamp(11px,0.72vw,14px)] font-medium leading-snug text-paper">
                {row.name}
              </span>
              <CostCell value={row.current} muted={row.current === null} />
              <CostCell value={row.transformation} />
              <CostCell value={row.futureMaint} />
              <TimelineTrack phases={row.phases} />
            </motion.div>
          ))}
        </div>

        {/* total */}
        <div
          className="grid shrink-0 items-center gap-x-[clamp(0.4rem,0.7vw,0.75rem)] border-t border-white/10 bg-navy-800/95 px-[clamp(0.55rem,0.9vw,0.9rem)] py-[clamp(0.45rem,0.85vh,0.7rem)]"
          style={{ gridTemplateColumns: TABLE_COLS }}
        >
          <span className="text-[clamp(11px,0.72vw,14px)] font-semibold uppercase tracking-[0.08em] text-paper">
            Total
          </span>
          <span className="text-right text-[clamp(11px,0.72vw,14px)] font-semibold tabular-nums text-paper">
            {ROADMAP_TOTALS.current.toLocaleString('en-US')}
          </span>
          <span className="text-right text-[clamp(11px,0.72vw,14px)] font-semibold tabular-nums text-paper">
            {ROADMAP_TOTALS.transformation.toLocaleString('en-US')}
          </span>
          <span className="text-right text-[clamp(11px,0.72vw,14px)] font-semibold tabular-nums text-paper">
            {ROADMAP_TOTALS.futureMaint.toLocaleString('en-US')}
          </span>
          <span className="text-[clamp(10px,0.62vw,13px)] leading-snug text-mist/85">
            Indicative 5-year cost, transformation + 4 × future maintenance: EUR{' '}
            {ROADMAP_TOTALS.indicative5Year.toLocaleString('en-US')}k
          </span>
        </div>
      </div>

      {/* legend + footnotes */}
      <div className="mt-[clamp(0.4rem,0.8vh,0.65rem)] flex shrink-0 flex-col gap-[clamp(0.3rem,0.6vh,0.5rem)]">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {ROADMAP_LEGEND.map((item) => (
            <span
              key={item.kind}
              className="inline-flex items-center gap-1.5 text-[clamp(9px,0.55vw,11px)] text-mist/75"
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-[2px]"
                style={{ background: ROADMAP_PHASE_COLORS[item.kind] }}
              />
              {item.label}
            </span>
          ))}
        </div>
        <div className="space-y-0.5 text-[clamp(8px,0.5vw,10px)] leading-snug text-mist/55">
          {ROADMAP_FOOTNOTES.map((note) => (
            <p key={note}>{note}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
