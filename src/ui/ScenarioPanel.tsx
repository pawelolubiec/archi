import { motion, AnimatePresence } from 'framer-motion';
import { scenarios, scenarioById } from '../data/scenarios';
import { systemById } from '../data/systems';
import { kpiById } from '../data/kpis';
import { useStore } from '../store/useStore';
import { AnimatedNumber } from './AnimatedNumber';

export function ScenarioPanel() {
  const scenarioId = useStore((s) => s.scenarioId);
  const setScenario = useStore((s) => s.setScenario);
  const scenario = scenarioId ? scenarioById[scenarioId] : null;

  return (
    <div className="pointer-events-auto flex w-full max-w-6xl gap-4">
      {/* scenario selection */}
      <div className="w-56 shrink-0 space-y-2">
        <div className="mb-2 text-xs uppercase tracking-[0.22em] text-mist">
          Investment scenario
        </div>
        {scenarios.map((s) => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id}
              onClick={() => setScenario(active ? null : s.id)}
              className="w-full rounded-lg border px-3.5 py-2 text-left text-sm transition lg:text-base"
              style={{
                borderColor: active ? '#D6BF9199' : 'rgba(255,255,255,0.08)',
                background: active ? 'rgba(214,191,145,0.10)' : 'rgba(255,255,255,0.03)',
                color: active ? '#D6BF91' : '#F2F7FC',
              }}
            >
              {s.name}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {scenario ? (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="flex min-w-0 flex-1 gap-4"
          >
            {/* details */}
            <div className="min-w-0 flex-1 self-start rounded-2xl border border-white/10 bg-navy-900/60 p-4 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-xl text-paper lg:text-2xl">
                    {scenario.name}
                  </h3>
                  <p className="mt-1 max-w-xl text-sm text-mist lg:text-base">
                    {scenario.summary}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs uppercase tracking-[0.2em] text-mist">
                    Horizon
                  </div>
                  <div className="text-sm text-paper lg:text-base">{scenario.horizon}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-4 gap-3">
                <Stat label="CAPEX" tone="#D6BF91" prefix="€ " suffix="M" numeric={scenario.capexK / 1000} decimals={1} />
                <Stat label="OPEX / year" tone="#9DB4CC" prefix="€ " suffix="k" numeric={scenario.opexAnnualK} />
                <Stat label="EBITDA / year" tone="#34D399" prefix="+€ " suffix="k" numeric={scenario.ebitdaAnnualK} />
                <Stat label="Payback" tone="#2EC5C5" suffix=" mo." numeric={scenario.paybackMonths} />
              </div>

              <div className="mt-2.5">
                <div className="text-xs uppercase tracking-[0.2em] text-mist">
                  Activates systems
                </div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {scenario.activatesSystems.map((id) => (
                    <span
                      key={id}
                      className="rounded border border-sea/30 bg-sea/5 px-2 py-0.5 text-xs text-sea"
                    >
                      {systemById[id]?.short ?? id}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-4">
                <Block title="Risks" items={scenario.risks} dot="#ff8a8a" />
                <Block title="Implementation sequence" items={scenario.sequence} dot="#2EC5C5" numbered />
              </div>
            </div>

            {/* KPI impact projection */}
            <div className="w-72 shrink-0 self-start rounded-2xl border border-white/10 bg-navy-900/60 p-4 backdrop-blur-sm">
              <div className="text-xs uppercase tracking-[0.22em] text-mist">
                KPI impact projection
              </div>
              <div className="mt-2.5 space-y-1.5">
                {Object.entries(scenario.kpiDeltas).map(([kid, delta]) => {
                  const kpi = kpiById[kid];
                  if (!kpi) return null;
                  const value = kpi.baseline + delta;
                  const improved = kpi.higherBetter ? delta > 0 : delta < 0;
                  return (
                    <div
                      key={kid}
                      className="flex items-baseline justify-between gap-2 border-b border-white/5 pb-1.5 text-sm"
                    >
                      <span className="truncate text-mist">{kpi.name}</span>
                      <span className="shrink-0 font-mono text-xs text-paper/70">
                        {kpi.baseline} →{' '}
                        <span
                          className="font-semibold"
                          style={{ color: improved ? '#34D399' : '#ff8a8a' }}
                        >
                          {value}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-mist/70">
                Reference estimates — to be validated with Controlling and the
                Data Platform.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex h-56 flex-1 items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-base text-mist"
          >
            Select a scenario to see the impact on architecture and KPIs.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({
  label,
  tone,
  numeric,
  suffix = '',
  prefix = '',
  decimals = 0,
}: {
  label: string;
  tone: string;
  numeric: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-mist">{label}</div>
      <div className="text-lg font-semibold" style={{ color: tone }}>
        {prefix}
        <AnimatedNumber value={numeric} decimals={decimals} />
        {suffix}
      </div>
    </div>
  );
}

function Block({
  title,
  items,
  dot,
  numbered = false,
}: {
  title: string;
  items: string[];
  dot: string;
  numbered?: boolean;
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.2em] text-mist">{title}</div>
      <ul className="mt-1.5 space-y-1.5">
        {items.map((it, i) => (
          <li key={it} className="flex items-center gap-2 text-sm text-paper/90">
            {numbered ? (
              <span className="shrink-0 text-xs text-sea">{i + 1}.</span>
            ) : (
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: dot }} />
            )}
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
