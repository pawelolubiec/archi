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

function ProcessChevron({
  proc,
  index,
  isFirst,
  isLast,
}: {
  proc: (typeof BUSINESS_PROCESSES)[number];
  index: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.35 }}
      className="flex min-h-[2.75rem] items-center justify-center px-2 py-2 text-center"
      style={{
        background: proc.color,
        clipPath: isFirst
          ? 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)'
          : isLast
            ? 'polygon(8px 0, 100% 0, 100% 100%, 8px 100%, 0 50%)'
            : 'polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%)',
      }}
      title={`${proc.order}. ${proc.label}`}
    >
      <span
        className="text-[11px] font-semibold leading-snug sm:text-xs"
        style={{ color: proc.order >= 10 ? '#1a2332' : '#fff' }}
      >
        <span className="mr-1 opacity-75">{proc.order}</span>
        {proc.label}
      </span>
    </motion.div>
  );
}

function ProcessStrip() {
  const rowA = BUSINESS_PROCESSES.slice(0, 6);
  const rowB = BUSINESS_PROCESSES.slice(6);

  return (
    <div className="shrink-0">
      <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-mist">
        Business Process Layer
      </div>
      <div className="grid grid-cols-6 gap-1">
        {rowA.map((proc, i) => (
          <ProcessChevron
            key={proc.id}
            proc={proc}
            index={i}
            isFirst={i === 0}
            isLast={i === rowA.length - 1}
          />
        ))}
      </div>
      <div className="mt-1 grid grid-cols-5 gap-1 px-[4%]">
        {rowB.map((proc, i) => (
          <ProcessChevron
            key={proc.id}
            proc={proc}
            index={i + 6}
            isFirst={i === 0}
            isLast={i === rowB.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

function ElementChip({
  element,
  index,
  compact,
}: {
  element: ArchitectureElement;
  index: number;
  compact?: boolean;
}) {
  const color = primaryProcessColor(element.linkedProcessIds);
  const badges = formatProcessBadges(element.linkedProcessIds);
  const openApp = useStore((s) => s.openApp);

  const baseClass = compact
    ? 'inline-flex items-center gap-1.5 rounded-md border bg-white/5 px-2.5 py-1 text-xs'
    : 'inline-flex items-center gap-2 rounded-lg border bg-white/5 px-3 py-2 text-sm';

  const inner = (
    <>
      <span className="font-medium text-paper/95">{element.label}</span>
      {badges && (
        <span className="text-[10px] font-semibold opacity-80" style={{ color }}>
          {badges}
        </span>
      )}
      {element.systemId && (
        <span className="text-[10px] text-sea opacity-0 transition-opacity group-hover:opacity-100">
          ↗
        </span>
      )}
    </>
  );

  const style = {
    borderColor: `${color}99`,
    borderLeftWidth: '3px',
    boxShadow: `0 0 24px -12px ${color}77`,
  };

  if (element.systemId) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 + index * 0.03, duration: 0.3 }}
        onClick={() => openApp(element.systemId!)}
        className={`group ${baseClass} transition hover:scale-[1.03] hover:border-sea/60`}
        style={style}
        title="Open app preview"
      >
        {inner}
      </motion.button>
    );
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.03, duration: 0.3 }}
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
  grow,
}: {
  layerId: ArchLayerId;
  elements: ArchitectureElement[];
  delay: number;
  grow?: boolean;
}) {
  if (!elements.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col rounded-xl border border-white/10 bg-navy-900/75 px-5 py-4 backdrop-blur-md ${
        grow ? 'min-h-0 flex-1' : 'shrink-0'
      }`}
    >
      <div className="mb-3 shrink-0 text-sm font-semibold text-sea">
        {ARCH_LAYER_LABELS[layerId]}
      </div>
      <div
        className={`flex flex-wrap content-start gap-2 ${
          grow ? 'min-h-0 flex-1 overflow-y-auto' : ''
        }`}
      >
        {elements.map((el, i) => (
          <ElementChip
            key={el.id}
            element={el}
            index={i}
            compact={layerId === 'data'}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function ArchitectureLayers() {
  const mode = useStore((s) => s.mode);
  const elements = useStore((s) => s.architectureConfig.elements);

  const byLayer = (layer: ArchLayerId) =>
    elements.filter((el) => el.layer === layer);

  return (
    <div className="pointer-events-auto flex h-full w-full flex-col gap-3">
      <ProcessStrip />

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <LayerSection layerId="ai" elements={byLayer('ai')} delay={0.08} grow />
        <LayerSection layerId="data" elements={byLayer('data')} delay={0.14} />
        <LayerSection layerId="apps" elements={byLayer('apps')} delay={0.2} grow />
      </div>

      {mode === 'technical' && (
        <p className="shrink-0 text-center text-[11px] text-mist">
          Color-coded by process number — AI above data, all applications in one layer.
        </p>
      )}
    </div>
  );
}
