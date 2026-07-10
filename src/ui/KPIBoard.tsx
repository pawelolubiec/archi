import { motion } from 'framer-motion';
import { kpis } from '../data/kpis';
import { systemById } from '../data/systems';
import { scenarioById } from '../data/scenarios';
import { useStore } from '../store/useStore';
import type { KPI } from '../data/types';
import { AnimatedBar, AnimatedDelta, AnimatedNumber } from './AnimatedNumber';

function projectedValue(kpi: KPI, deltas?: Record<string, number>): number {
  if (!deltas || deltas[kpi.id] === undefined) return kpi.baseline;
  return kpi.baseline + deltas[kpi.id];
}

function progress(kpi: KPI, value: number): number {
  const span = kpi.target - kpi.baseline;
  if (span === 0) return 1;
  return Math.max(0, Math.min(1, (value - kpi.baseline) / span));
}

export function KPIBoard({ compact = false }: { compact?: boolean }) {
  const scenarioId = useStore((s) => s.scenarioId);
  const scenario = scenarioId ? scenarioById[scenarioId] : null;

  return (
    <div className="pointer-events-auto w-full max-w-[90vw]">
      <div className={`grid gap-4 ${compact ? 'grid-cols-5' : 'grid-cols-5'}`}>
        {kpis.map((kpi, i) => {
          const value = projectedValue(kpi, scenario?.kpiDeltas);
          const delta = value - kpi.baseline;
          const improved = kpi.higherBetter ? delta > 0 : delta < 0;
          const pct = progress(kpi, value);
          const decimals = value % 1 === 0 ? 0 : 1;

          return (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
              className="slide-card p-3"
            >
              <div className="text-xs uppercase tracking-[0.16em] text-mist">
                {kpi.name}
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-display text-2xl text-paper lg:text-3xl">
                  <AnimatedNumber
                    value={value}
                    decimals={decimals}
                    delay={i * 0.05}
                  />
                </span>
                <span className="text-xs text-mist">{kpi.unit}</span>
                {scenario && delta !== 0 && (
                  <AnimatedDelta delta={delta} improved={improved} decimals={decimals} />
                )}
              </div>

              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <AnimatedBar
                  widthPct={pct * 100}
                  color={scenario ? '#34D399' : '#2EC5C5'}
                  delay={i * 0.05 + 0.15}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-mist">
                <span>base {kpi.baseline}</span>
                <span>target {kpi.target}</span>
              </div>

              {!compact && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {kpi.affectedBy.slice(0, 4).map((sid) => (
                    <span
                      key={sid}
                      className="rounded border border-white/10 px-1.5 py-0.5 text-xs text-sea"
                    >
                      {systemById[sid]?.short ?? sid}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      {!compact && (
        <p className="mt-2.5 text-center text-xs text-mist/70">
          Baseline values and targets — to be validated with Data Platform (Superset) before the meeting.
        </p>
      )}
    </div>
  );
}
