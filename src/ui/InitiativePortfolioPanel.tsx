import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  INITIATIVE_CLUSTERS,
  INITIATIVE_ROWS,
  type InitiativeRow,
} from '../data/initiativePortfolio';

const PRIORITY_STYLE: Record<InitiativeRow['priority'], string> = {
  High: 'border-rose-300/35 bg-rose-300/10 text-rose-200',
  'Medium-high': 'border-gold/35 bg-gold/10 text-gold',
  Medium: 'border-sea/30 bg-sea/10 text-sea',
};

export function InitiativePortfolioPanel() {
  const [hoveredClusterId, setHoveredClusterId] = useState<string | null>(null);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const rowsById = new Map(INITIATIVE_ROWS.map((row) => [row.id, row]));
  const tableColumns = 'clamp(10rem, 14vw, 14rem) minmax(0, 1fr)';
  const rowColumns =
    'minmax(7.5rem, 1.05fr) minmax(14rem, 1.9fr) repeat(3, minmax(8rem, 1fr))';

  return (
    <div className="pointer-events-auto h-full max-h-[min(42rem,100%)] w-full max-w-[100rem]">
      <div className="relative flex h-full min-h-0 flex-col overflow-visible rounded-xl border border-white/10 bg-navy-900/65 shadow-panel backdrop-blur-sm">
        <div
          className="grid shrink-0 rounded-t-xl border-b border-white/10 bg-white/[0.035]"
          style={{ gridTemplateColumns: tableColumns }}
        >
          <span className="px-[clamp(0.65rem,1vw,1rem)] py-[clamp(0.35rem,0.7vh,0.55rem)] text-[clamp(9px,0.55vw,11px)] font-semibold uppercase tracking-[0.14em] text-mist/65">
            Priority
          </span>
          <div
            className="grid gap-[clamp(0.45rem,0.75vw,0.8rem)] px-[clamp(0.65rem,1vw,1rem)] py-[clamp(0.35rem,0.7vh,0.55rem)] text-[clamp(8px,0.48vw,10px)] font-semibold uppercase tracking-[0.12em] text-mist/65"
            style={{ gridTemplateColumns: rowColumns }}
          >
            <span>Initiative</span>
            <span>Transformation move</span>
            <span>Profitability</span>
            <span>Margin</span>
            <span>Product portfolio</span>
          </div>
        </div>

        {INITIATIVE_CLUSTERS.map((cluster, clusterIndex) => {
          const rows = cluster.initiativeIds
            .map((id) => rowsById.get(id))
            .filter((row): row is InitiativeRow => Boolean(row));

          return (
            <motion.section
              key={cluster.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: hoveredClusterId === cluster.id && !reduceMotion ? 1.05 : 1,
              }}
              transition={{
                delay: hoveredClusterId ? 0 : clusterIndex * 0.08,
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`relative grid min-h-0 origin-left border-b border-white/10 last:border-b-0 ${
                hoveredClusterId === cluster.id
                  ? 'z-40 rounded-xl bg-navy-800/95 shadow-[0_22px_65px_rgba(0,10,24,0.68)] ring-1 ring-gold/45'
                  : 'z-10'
              }`}
              style={{ flex: rows.length, gridTemplateColumns: tableColumns }}
            >
              <div
                onMouseEnter={() => setHoveredClusterId(cluster.id)}
                onMouseLeave={() => setHoveredClusterId(null)}
                className="relative z-10 flex min-h-0 cursor-zoom-in flex-col justify-center border-r border-white/10 bg-navy-900/45 px-[clamp(0.65rem,1vw,1rem)] py-[clamp(0.35rem,0.7vh,0.65rem)] transition-colors duration-300 hover:bg-gold/10 motion-reduce:transition-none"
              >
                <div className="text-[clamp(13px,calc(0.5vw+0.7vh),17px)] font-semibold leading-tight text-paper">
                  {cluster.label}
                </div>
                <p className="mt-[clamp(0.2rem,0.45vh,0.4rem)] line-clamp-3 text-[clamp(10px,calc(0.3vw+0.45vh),13px)] leading-snug text-mist/75">
                  {cluster.summary}
                </p>
              </div>

              <div
                className="grid min-h-0"
                style={{ gridTemplateRows: `repeat(${rows.length}, minmax(0, 1fr))` }}
              >
                {rows.map((row) => {
                  const expanded = hoveredRowId === row.id;
                  return (
                    <div
                      key={row.id}
                      onMouseEnter={() => setHoveredRowId(row.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      className={`relative grid min-h-[4.75rem] gap-[clamp(0.45rem,0.75vw,0.8rem)] border-b border-white/[0.06] px-[clamp(0.65rem,1vw,1rem)] transition duration-300 ease-out last:border-b-0 motion-reduce:transform-none motion-reduce:transition-none ${
                        expanded
                          ? 'z-50 -my-8 min-h-[10rem] scale-[1.025] items-start rounded-xl bg-navy-800/95 py-4 shadow-[0_22px_65px_rgba(0,10,24,0.72)] ring-1 ring-gold/45'
                          : 'items-center py-[clamp(0.3rem,0.65vh,0.55rem)]'
                      }`}
                      style={{ gridTemplateColumns: rowColumns }}
                    >
                    <div className="min-w-0">
                      <div className="text-[clamp(13px,calc(0.45vw+0.65vh),17px)] font-semibold leading-tight text-paper">
                        {row.initiative}
                      </div>
                      <div className="mt-[clamp(0.15rem,0.4vh,0.35rem)] flex items-center gap-1.5">
                        <span
                          className={`shrink-0 rounded border px-1.5 py-0.5 text-[clamp(8px,0.48vw,10px)] font-semibold ${PRIORITY_STYLE[row.priority]}`}
                        >
                          {row.priority}
                        </span>
                        <span className="truncate text-[clamp(9px,0.55vw,11px)] text-mist/65">
                          {row.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-[1fr_auto_1.15fr] items-center gap-2">
                      <p className="text-[clamp(10px,calc(0.3vw+0.55vh),13px)] leading-snug text-mist">
                        {row.current}
                      </p>
                      <span className="text-[clamp(12px,0.8vw,16px)] text-gold/70">→</span>
                      <p className="text-[clamp(10px,calc(0.3vw+0.55vh),13px)] font-medium leading-snug text-paper/90">
                        {row.target}
                      </p>
                    </div>

                    <p
                      className="self-center text-[clamp(9px,calc(0.22vw+0.45vh),11px)] leading-snug text-paper/80"
                      title={row.profitability}
                    >
                      {row.profitability}
                    </p>
                    <p
                      className="self-center text-[clamp(9px,calc(0.22vw+0.45vh),11px)] leading-snug text-sea/90"
                      title={row.margin}
                    >
                      {row.margin}
                    </p>
                    <p
                      className="self-center text-[clamp(9px,calc(0.22vw+0.45vh),11px)] leading-snug text-gold/85"
                      title={row.productPortfolio}
                    >
                      {row.productPortfolio}
                    </p>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
