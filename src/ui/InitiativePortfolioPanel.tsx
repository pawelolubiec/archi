import { motion } from 'framer-motion';
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
  const rowsById = new Map(INITIATIVE_ROWS.map((row) => [row.id, row]));
  const tableColumns = 'clamp(10rem, 14vw, 14rem) minmax(0, 1fr)';

  return (
    <div className="pointer-events-auto h-full max-h-[34rem] w-full max-w-[100rem]">
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-white/10 bg-navy-900/65 shadow-panel backdrop-blur-sm">
        <div
          className="grid shrink-0 border-b border-white/10 bg-white/[0.035]"
          style={{ gridTemplateColumns: tableColumns }}
        >
          <span className="px-[clamp(0.65rem,1vw,1rem)] py-[clamp(0.35rem,0.7vh,0.55rem)] text-[clamp(9px,0.55vw,11px)] font-semibold uppercase tracking-[0.14em] text-mist/65">
            Priority
          </span>
          <div className="grid grid-cols-[1fr_2.2fr_1.25fr] gap-[clamp(0.5rem,1vw,1rem)] px-[clamp(0.65rem,1vw,1rem)] py-[clamp(0.35rem,0.7vh,0.55rem)] text-[clamp(9px,0.55vw,11px)] font-semibold uppercase tracking-[0.14em] text-mist/65">
            <span>Initiative</span>
            <span>Transformation move</span>
            <span>Business value</span>
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
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: clusterIndex * 0.08, duration: 0.35 }}
              className="grid min-h-0 border-b border-white/10 last:border-b-0"
              style={{ flex: rows.length, gridTemplateColumns: tableColumns }}
            >
              <div className="flex min-h-0 flex-col justify-center border-r border-white/10 bg-white/[0.02] px-[clamp(0.65rem,1vw,1rem)] py-[clamp(0.35rem,0.7vh,0.65rem)]">
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
                {rows.map((row) => (
                  <div
                    key={row.id}
                    className="grid min-h-0 grid-cols-[1fr_2.2fr_1.25fr] items-center gap-[clamp(0.5rem,1vw,1rem)] border-b border-white/[0.06] px-[clamp(0.65rem,1vw,1rem)] py-[clamp(0.3rem,0.65vh,0.55rem)] last:border-b-0"
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
                      <p className="line-clamp-2 text-[clamp(11px,calc(0.35vw+0.65vh),14px)] leading-snug text-mist">
                        {row.current}
                      </p>
                      <span className="text-[clamp(12px,0.8vw,16px)] text-gold/70">→</span>
                      <p className="line-clamp-2 text-[clamp(11px,calc(0.35vw+0.65vh),14px)] font-medium leading-snug text-paper/90">
                        {row.target}
                      </p>
                    </div>

                    <p className="line-clamp-2 self-center text-[clamp(11px,calc(0.35vw+0.65vh),14px)] leading-snug text-sea/90">
                      {row.businessValue}
                    </p>
                  </div>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}
