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

  return (
    <div className="pointer-events-auto w-full max-w-7xl">
      <div className="overflow-hidden rounded-xl border border-white/10 bg-navy-900/65 shadow-panel backdrop-blur-sm">
        <div className="grid grid-cols-[11rem_1fr] border-b border-white/10 bg-white/[0.035] lg:grid-cols-[13rem_1fr]">
          <span className="px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-mist/65">
            Priority
          </span>
          <div className="grid grid-cols-[1fr_2.2fr_1.25fr] gap-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-mist/65">
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
              className="grid grid-cols-[11rem_1fr] border-b border-white/10 last:border-b-0 lg:grid-cols-[13rem_1fr]"
          >
              <div className="border-r border-white/10 bg-white/[0.02] px-4 py-2.5">
                <div className="text-sm font-semibold text-paper lg:text-base">{cluster.label}</div>
                <p className="mt-1 text-[11px] leading-snug text-mist/75 lg:text-xs">
                  {cluster.summary}
                </p>
              </div>

              <div>
                {rows.map((row, rowIndex) => (
                  <div
                    key={row.id}
                    className="grid grid-cols-[1fr_2.2fr_1.25fr] gap-4 border-b border-white/[0.06] px-4 py-2 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold leading-tight text-paper lg:text-[15px]">
                        {row.initiative}
                      </div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className={`shrink-0 rounded border px-1.5 py-0.5 text-[9px] font-semibold ${PRIORITY_STYLE[row.priority]}`}
                        >
                          {row.priority}
                        </span>
                        <span className="truncate text-[10px] text-mist/65 lg:text-[11px]">
                          {row.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid min-w-0 grid-cols-[1fr_auto_1.15fr] items-center gap-2">
                      <p className="line-clamp-2 text-[11px] leading-snug text-mist lg:text-xs">
                        {row.current}
                      </p>
                      <span className="text-sm text-gold/70">→</span>
                      <p className="line-clamp-2 text-[11px] font-medium leading-snug text-paper/90 lg:text-xs">
                        {row.target}
                      </p>
                    </div>

                    <p className="line-clamp-2 self-center text-[11px] leading-snug text-sea/90 lg:text-xs">
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
