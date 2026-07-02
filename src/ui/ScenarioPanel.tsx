import { motion, AnimatePresence } from 'framer-motion';
import { scenarios, scenarioById } from '../data/scenarios';
import { systemById } from '../data/systems';
import { useStore } from '../store/useStore';
import { KPIBoard } from './KPIBoard';

export function ScenarioPanel() {
  const scenarioId = useStore((s) => s.scenarioId);
  const setScenario = useStore((s) => s.setScenario);
  const scenario = scenarioId ? scenarioById[scenarioId] : null;

  return (
    <div className="pointer-events-auto flex w-full max-w-6xl gap-6">
      {/* scenario selection */}
      <div className="w-64 shrink-0 space-y-2">
        <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-mist">
          Investment scenario
        </div>
        {scenarios.map((s) => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id}
              onClick={() => setScenario(active ? null : s.id)}
              className="w-full rounded-lg border px-3 py-2.5 text-left text-sm transition"
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

      {/* details + KPI impact */}
      <div className="flex-1">
        <AnimatePresence mode="wait">
          {scenario ? (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <div className="rounded-2xl border border-white/10 bg-navy-900/60 p-5 backdrop-blur-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl text-paper">
                      {scenario.name}
                    </h3>
                    <p className="mt-1 max-w-xl text-sm text-mist">
                      {scenario.summary}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-mist">
                      Horizon
                    </div>
                    <div className="text-sm text-paper">{scenario.horizon}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-3 text-sm">
                  <Stat label="CAPEX" value={`€ ${(scenario.capexK / 1000).toFixed(1)}M`} tone="#D6BF91" />
                  <Stat label="OPEX / year" value={`€ ${scenario.opexAnnualK}k`} tone="#9DB4CC" />
                  <Stat label="EBITDA / year" value={`+€ ${scenario.ebitdaAnnualK}k`} tone="#34D399" />
                  <Stat label="Payback" value={`${scenario.paybackMonths} mo.`} tone="#2EC5C5" />
                </div>

                <div className="mt-3">
                  <div className="text-[10px] uppercase tracking-[0.2em] text-mist">
                    Activates systems
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {scenario.activatesSystems.map((id) => (
                      <span
                        key={id}
                        className="rounded border border-sea/30 bg-sea/5 px-1.5 py-0.5 text-xs text-sea"
                      >
                        {systemById[id]?.short ?? id}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <Block title="Risks" items={scenario.risks} dot="#ff8a8a" />
                  <Block title="Implementation sequence" items={scenario.sequence} dot="#2EC5C5" numbered />
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 text-[10px] uppercase tracking-[0.22em] text-mist">
                  KPI impact projection
                </div>
                <KPIBoard compact />
                <p className="mt-2 text-[11px] text-mist/70">
                  Reference estimates — CAPEX/OPEX/EBITDA to be validated with Controlling,
                  KPI baselines to be validated with Data Platform.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-white/10 text-center text-mist"
            >
              Select a scenario to see the impact on architecture and KPIs.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-mist">{label}</div>
      <div className="text-base font-semibold" style={{ color: tone }}>
        {value}
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
      <div className="text-[10px] uppercase tracking-[0.2em] text-mist">{title}</div>
      <ul className="mt-2 space-y-1.5">
        {items.map((it, i) => (
          <li key={it} className="flex items-center gap-2 text-sm text-paper/85">
            {numbered ? (
              <span className="text-xs text-sea">{i + 1}.</span>
            ) : (
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: dot }} />
            )}
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}
