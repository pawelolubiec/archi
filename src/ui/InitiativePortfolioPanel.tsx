import { motion } from 'framer-motion';
import {
  INITIATIVE_CLUSTERS,
  INITIATIVE_HEADLINE,
  INITIATIVE_ROWS,
  INITIATIVE_SUBLINE,
} from '../data/initiativePortfolio';

export function InitiativePortfolioPanel() {
  const totalCapex = INITIATIVE_ROWS.reduce((sum, r) => sum + r.capexK, 0);
  const totalEbitda = INITIATIVE_ROWS.reduce((sum, r) => sum + r.ebitdaK, 0);

  return (
    <div className="pointer-events-auto w-full max-w-6xl">
      <div className="mb-4 max-w-3xl">
        <p className="text-slide-body font-medium text-paper">{INITIATIVE_HEADLINE}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-mist">{INITIATIVE_SUBLINE}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-4">
        {INITIATIVE_CLUSTERS.map((cluster, i) => (
          <motion.div
            key={cluster.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35 }}
            className={`rounded-xl border px-3 py-2.5 ${
              cluster.highlight
                ? 'border-gold/40 bg-gold/10'
                : 'border-white/10 bg-navy-900/50'
            }`}
          >
            <div className="text-sm font-semibold text-paper">{cluster.label}</div>
            <div className="mt-0.5 text-xs leading-snug text-mist">{cluster.summary}</div>
          </motion.div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-navy-900/60 backdrop-blur-sm">
        <div className="grid grid-cols-[1.4fr_0.9fr_0.7fr_0.6fr_0.6fr_1fr] gap-2 border-b border-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-mist/70">
          <span>Initiative</span>
          <span>Cluster</span>
          <span>Horizon</span>
          <span className="text-right">CAPEX</span>
          <span className="text-right">EBITDA/yr</span>
          <span>Decision point</span>
        </div>
        <div className="max-h-[min(42vh,22rem)] overflow-y-auto">
          {INITIATIVE_ROWS.map((row, i) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 + i * 0.04 }}
              className="grid grid-cols-[1.4fr_0.9fr_0.7fr_0.6fr_0.6fr_1fr] gap-2 border-b border-white/5 px-4 py-2.5 text-sm last:border-b-0"
            >
              <span className="font-medium text-paper">{row.initiative}</span>
              <span className="text-mist">{row.cluster}</span>
              <span className="font-mono text-xs text-mist/90">{row.horizon}</span>
              <span className="text-right font-mono text-xs text-sea">
                €{(row.capexK / 1000).toFixed(1)}M
              </span>
              <span className="text-right font-mono text-xs text-green">
                +€{(row.ebitdaK / 1000).toFixed(1)}M
              </span>
              <span className="text-xs text-gold/90">{row.decision ?? '—'}</span>
            </motion.div>
          ))}
        </div>
        <div className="grid grid-cols-[1.4fr_0.9fr_0.7fr_0.6fr_0.6fr_1fr] gap-2 border-t border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-semibold">
          <span className="col-span-3 text-mist">Portfolio subtotal (shown initiatives)</span>
          <span className="text-right font-mono text-sea">
            €{(totalCapex / 1000).toFixed(1)}M
          </span>
          <span className="text-right font-mono text-green">
            +€{(totalEbitda / 1000).toFixed(1)}M
          </span>
          <span className="text-mist/60">Estimates · validate with Controlling</span>
        </div>
      </div>
    </div>
  );
}
