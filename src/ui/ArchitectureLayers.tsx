import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { systems } from '../data/systems';

const SHORT_TO_ID = Object.fromEntries(systems.map((s) => [s.short, s.id]));
// additional aliases used in the diagram
SHORT_TO_ID['DATA'] = 'data_platform';
SHORT_TO_ID['AI'] = 'gone_ai';

interface Layer {
  label: string;
  items: string[];
  tone: 'mist' | 'sea' | 'gold' | 'green';
  note?: string;
}

const LAYERS: Layer[] = [
  { label: 'Users · Customers · Partners', items: ['Customers', 'Sales offices', 'Partners'], tone: 'mist' },
  {
    label: 'Specialized systems',
    items: ['MiFo', 'APS', 'PTS', 'PID', 'WMS', 'QMS'],
    tone: 'sea',
  },
  { label: 'Integration Layer · API · Event Bus', items: ['Integrations', 'Events', 'API'], tone: 'green' },
  {
    label: 'ERP Financial Core',
    items: ['Finance', 'Ledger', 'AP / AR', 'Inventory valuation'],
    tone: 'gold',
    note: 'Workday / IFS candidate · core, not a monolith',
  },
  { label: 'Data Platform', items: ['Lakehouse', 'KPI model', 'BI / Superset'], tone: 'sea' },
  { label: 'AI Agents · Gone-AI', items: ['Prediction', 'Automation', 'Digital Twin'], tone: 'gold' },
];

const TONE: Record<Layer['tone'], string> = {
  mist: '#9DB4CC',
  sea: '#2EC5C5',
  green: '#34D399',
  gold: '#D6BF91',
};

export function ArchitectureLayers() {
  const mode = useStore((s) => s.mode);

  return (
    <div className="pointer-events-auto w-full max-w-3xl">
      <div className="space-y-2.5">
        {LAYERS.map((layer, i) => {
          const isCore = layer.tone === 'gold' && layer.label.includes('ERP');
          return (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-start gap-2 rounded-xl border bg-navy-900/60 px-4 py-3 backdrop-blur-sm md:flex-row md:items-center md:gap-4 md:px-5"
              style={{
                borderColor: isCore ? `${TONE.gold}99` : 'rgba(255,255,255,0.08)',
                boxShadow: isCore ? `0 0 40px -12px ${TONE.gold}66` : 'none',
              }}
            >
              <div className="w-full shrink-0 md:w-56">
                <div
                  className="text-sm font-semibold"
                  style={{ color: TONE[layer.tone] }}
                >
                  {layer.label}
                </div>
                {layer.note && (
                  <div className="mt-0.5 text-[11px] text-gold/80">{layer.note}</div>
                )}
              </div>
              <div className="flex flex-1 flex-wrap gap-2">
                {layer.items.map((it) => {
                  const sysId = SHORT_TO_ID[it];
                  if (sysId) {
                    return (
                      <button
                        key={it}
                        onClick={() => useStore.getState().openApp(sysId)}
                        className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-paper/85 transition hover:border-sea/50 hover:text-sea"
                        title="Open app preview"
                      >
                        {it} ↗
                      </button>
                    );
                  }
                  return (
                    <span
                      key={it}
                      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-paper/85"
                    >
                      {it}
                    </span>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>
      {mode === 'technical' && (
        <p className="mt-4 text-center text-xs text-mist">
          Event flow: specialized systems ↔ Event Bus ↔ ERP (finance) ↔
          Data Platform ↔ AI.
        </p>
      )}
    </div>
  );
}
