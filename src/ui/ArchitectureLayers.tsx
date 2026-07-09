import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  ARCH_LAYER_LABELS,
  BUSINESS_PROCESSES,
  formatProcessBadges,
  primaryProcessColor,
  type ArchLayerId,
  type ArchitectureElement,
} from '../data/architectureLayout';

function ProcessStrip() {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-mist">
        Business Process Layer
      </div>
      <div className="flex gap-0.5 overflow-x-auto pb-1">
        {BUSINESS_PROCESSES.map((proc, i) => (
          <motion.div
            key={proc.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.35 }}
            className="flex min-w-0 flex-1 items-center justify-center px-1 py-1.5 text-center"
            style={{
              background: proc.color,
              clipPath:
                i === 0
                  ? 'polygon(0 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 0 100%)'
                  : i === BUSINESS_PROCESSES.length - 1
                    ? 'polygon(6px 0, 100% 0, 100% 100%, 6px 100%, 0 50%)'
                    : 'polygon(6px 0, calc(100% - 6px) 0, 100% 50%, calc(100% - 6px) 100%, 6px 100%, 0 50%)',
            }}
            title={`${proc.order}. ${proc.label}`}
          >
            <span
              className="truncate text-[8px] font-semibold leading-tight"
              style={{
                color: proc.order >= 10 ? '#1a2332' : '#fff',
              }}
            >
              <span className="mr-0.5 opacity-70">{proc.order}</span>
              {proc.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ElementChip({
  element,
  index,
  inline,
}: {
  element: ArchitectureElement;
  index: number;
  inline?: boolean;
}) {
  const color = primaryProcessColor(element.linkedProcessIds);
  const badges = formatProcessBadges(element.linkedProcessIds);
  const openApp = useStore((s) => s.openApp);

  const baseClass = inline
    ? 'inline-flex items-center gap-1 rounded-md border bg-white/5 px-2 py-0.5 text-[11px]'
    : 'inline-flex items-center gap-1.5 rounded-lg border bg-white/5 px-2.5 py-1.5 text-xs';

  const inner = (
    <>
      <span className="text-paper/90">{element.label}</span>
      {badges && (
        <span className="text-[9px] font-medium opacity-70" style={{ color }}>
          {badges}
        </span>
      )}
      {element.systemId && (
        <span className="text-[9px] text-sea opacity-0 transition-opacity group-hover:opacity-100">
          ↗
        </span>
      )}
    </>
  );

  const style = {
    borderColor: `${color}88`,
    borderLeftWidth: inline ? undefined : '3px',
    boxShadow: `0 0 20px -10px ${color}66`,
  };

  if (element.systemId) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.15 + index * 0.04, duration: 0.3 }}
        onClick={() => openApp(element.systemId!)}
        className={`group ${baseClass} transition hover:scale-105 hover:border-sea/60`}
        style={style}
        title="Open app preview"
      >
        {inner}
      </motion.button>
    );
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.15 + index * 0.04, duration: 0.3 }}
      className={baseClass}
      style={style}
    >
      {inner}
    </motion.span>
  );
}

function LayerSection({
  layerId,
  elements,
  delay,
  inline,
}: {
  layerId: ArchLayerId;
  elements: ArchitectureElement[];
  delay: number;
  inline?: boolean;
}) {
  if (!elements.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-white/8 bg-navy-900/60 px-4 py-3 backdrop-blur-sm"
    >
      <div className="mb-2 text-xs font-semibold text-sea">
        {ARCH_LAYER_LABELS[layerId]}
      </div>
      {inline ? (
        <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
          {elements.map((el, i) => (
            <span key={el.id} className="inline-flex items-center">
              <ElementChip element={el} index={i} inline />
              {i < elements.length - 1 && (
                <span className="mx-1 text-mist/40">|</span>
              )}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {elements.map((el, i) => (
            <ElementChip key={el.id} element={el} index={i} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function ArchitectureLayers() {
  const mode = useStore((s) => s.mode);
  const elements = useStore((s) => s.architectureConfig.elements);

  const byLayer = (layer: ArchLayerId) =>
    elements.filter((el) => el.layer === layer);

  return (
    <div className="pointer-events-auto w-full max-w-6xl">
      <ProcessStrip />

      <div className="space-y-2.5">
        <LayerSection layerId="ai" elements={byLayer('ai')} delay={0.1} />
        <LayerSection layerId="data" elements={byLayer('data')} delay={0.18} inline />
        <LayerSection layerId="apps" elements={byLayer('apps')} delay={0.26} />
      </div>

      {mode === 'technical' && (
        <p className="mt-4 text-center text-xs text-mist">
          Color-coded links: each element connects to business processes by number.
          AI orchestration sits above the data platform; all applications share one layer.
        </p>
      )}
    </div>
  );
}
