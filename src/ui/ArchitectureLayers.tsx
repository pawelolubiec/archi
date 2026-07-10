import { useMemo, useState } from 'react';
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
  highlighted,
  dimmed,
  onHover,
}: {
  proc: (typeof BUSINESS_PROCESSES)[number];
  index: number;
  isFirst: boolean;
  isLast: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onHover: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{
        opacity: dimmed ? 0.28 : 1,
        y: 0,
        scale: highlighted ? 1.06 : 1,
      }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onMouseEnter={onHover}
      className="flex min-h-[2.5rem] cursor-pointer items-center justify-center px-1 py-1.5 text-center transition-shadow"
      style={{
        background: proc.color,
        clipPath: isFirst
          ? 'polygon(0 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 0 100%)'
          : isLast
            ? 'polygon(8px 0, 100% 0, 100% 100%, 8px 100%, 0 50%)'
            : 'polygon(8px 0, calc(100% - 8px) 0, 100% 50%, calc(100% - 8px) 100%, 8px 100%, 0 50%)',
        boxShadow: highlighted
          ? `0 0 0 2px #fff, 0 0 28px -4px ${proc.color}`
          : undefined,
        zIndex: highlighted ? 2 : 0,
      }}
      title={`${proc.order}. ${proc.label}`}
    >
      <span
        className="text-slide-caption font-semibold leading-tight sm:text-sm"
        style={{ color: proc.order >= 10 ? '#1a2332' : '#fff' }}
      >
        <span className="mr-1 opacity-75">{proc.order}</span>
        {proc.label}
      </span>
    </motion.div>
  );
}

function ProcessStrip({
  highlightedProcessIds,
  onHoverProcess,
}: {
  highlightedProcessIds: Set<string>;
  onHoverProcess: (id: string) => void;
}) {
  const isFiltering = highlightedProcessIds.size > 0;

  return (
    <div className="shrink-0">
      <div className="mb-2 text-slide-caption font-semibold uppercase tracking-[0.18em] text-mist">
        Business Process Layer
      </div>
      <div className="grid grid-cols-11 gap-0.5">
        {BUSINESS_PROCESSES.map((proc, i) => {
          const highlighted = highlightedProcessIds.has(proc.id);
          const dimmed = isFiltering && !highlighted;
          return (
            <ProcessChevron
              key={proc.id}
              proc={proc}
              index={i}
              isFirst={i === 0}
              isLast={i === BUSINESS_PROCESSES.length - 1}
              highlighted={highlighted}
              dimmed={dimmed}
              onHover={() => onHoverProcess(proc.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function ElementChip({
  element,
  index,
  compact,
  highlighted,
  dimmed,
  onHover,
}: {
  element: ArchitectureElement;
  index: number;
  compact?: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onHover: () => void;
}) {
  const color = primaryProcessColor(element.linkedProcessIds);
  const badges = formatProcessBadges(element.linkedProcessIds);
  const openApp = useStore((s) => s.openApp);

  const baseClass = compact
    ? 'inline-flex items-center gap-1.5 rounded-md border bg-white/5 px-3 py-1.5 text-slide-caption'
    : 'inline-flex items-center gap-2 rounded-lg border bg-white/5 px-3 py-1.5 text-sm lg:text-base';

  const inner = (
    <>
      <span className="font-medium text-paper/95">{element.label}</span>
      {badges && (
        <span className="text-slide-caption font-semibold opacity-80" style={{ color }}>
          {badges}
        </span>
      )}
      {element.systemId && (
        <span
          className={`text-slide-caption text-sea transition-opacity ${
            highlighted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          ↗
        </span>
      )}
    </>
  );

  const style = {
    borderColor: highlighted ? color : `${color}99`,
    borderLeftWidth: '3px',
    boxShadow: highlighted
      ? `0 0 0 1px ${color}, 0 0 32px -6px ${color}`
      : `0 0 24px -12px ${color}77`,
    opacity: dimmed ? 0.28 : 1,
    transform: highlighted ? 'scale(1.04)' : undefined,
  };

  const hoverHandlers = { onMouseEnter: onHover };

  if (element.systemId) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: dimmed ? 0.28 : 1, scale: highlighted ? 1.04 : 1 }}
        transition={{ delay: 0.1 + index * 0.03, duration: 0.2 }}
        onClick={() => openApp(element.systemId!)}
        className={`group ${baseClass} cursor-pointer transition hover:border-sea/60`}
        style={style}
        title="Open app preview"
        {...hoverHandlers}
      >
        {inner}
      </motion.button>
    );
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: dimmed ? 0.28 : 1, scale: highlighted ? 1.04 : 1 }}
      transition={{ delay: 0.1 + index * 0.03, duration: 0.2 }}
      className={`${baseClass} cursor-pointer`}
      style={style}
      {...hoverHandlers}
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
  highlightedElementIds,
  onHoverElement,
}: {
  layerId: ArchLayerId;
  elements: ArchitectureElement[];
  delay: number;
  grow?: boolean;
  highlightedElementIds: Set<string>;
  onHoverElement: (id: string) => void;
}) {
  if (!elements.length) return null;

  const isFiltering = highlightedElementIds.size > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col rounded-xl border border-white/10 bg-navy-900/75 px-4 py-3 backdrop-blur-md ${
        grow ? 'min-h-0 flex-1' : 'shrink-0'
      }`}
    >
      <div className="mb-2 shrink-0 text-sm font-semibold text-sea lg:text-base">
        {ARCH_LAYER_LABELS[layerId]}
      </div>
      <div
        className={`flex flex-wrap content-start gap-2 ${
          grow ? 'min-h-0 flex-1 overflow-y-auto' : ''
        }`}
      >
        {elements.map((el, i) => {
          const highlighted = highlightedElementIds.has(el.id);
          const dimmed = isFiltering && !highlighted;
          return (
            <ElementChip
              key={el.id}
              element={el}
              index={i}
              compact={layerId === 'data'}
              highlighted={highlighted}
              dimmed={dimmed}
              onHover={() => onHoverElement(el.id)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

export function ArchitectureLayers() {
  const mode = useStore((s) => s.mode);
  const elements = useStore((s) => s.architectureConfig.elements);
  const [hoveredProcessId, setHoveredProcessId] = useState<string | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  const elementById = useMemo(
    () => Object.fromEntries(elements.map((el) => [el.id, el])),
    [elements],
  );

  const { highlightedProcessIds, highlightedElementIds } = useMemo(() => {
    if (hoveredProcessId) {
      const connected = elements
        .filter((el) => el.linkedProcessIds.includes(hoveredProcessId))
        .map((el) => el.id);
      return {
        highlightedProcessIds: new Set([hoveredProcessId]),
        highlightedElementIds: new Set(connected),
      };
    }

    if (hoveredElementId) {
      const el = elementById[hoveredElementId];
      return {
        highlightedProcessIds: new Set(el?.linkedProcessIds ?? []),
        highlightedElementIds: new Set([hoveredElementId]),
      };
    }

    return {
      highlightedProcessIds: new Set<string>(),
      highlightedElementIds: new Set<string>(),
    };
  }, [hoveredProcessId, hoveredElementId, elements, elementById]);

  const hoverProcess = (id: string) => {
    setHoveredProcessId(id);
    setHoveredElementId(null);
  };

  const hoverElement = (id: string) => {
    setHoveredElementId(id);
    setHoveredProcessId(null);
  };

  const byLayer = (layer: ArchLayerId) =>
    elements.filter((el) => el.layer === layer);

  const isHovering = hoveredProcessId !== null || hoveredElementId !== null;

  return (
    <div
      className="pointer-events-auto flex h-full w-full flex-col gap-3"
      onMouseLeave={() => {
        setHoveredProcessId(null);
        setHoveredElementId(null);
      }}
    >
      <ProcessStrip
        highlightedProcessIds={highlightedProcessIds}
        onHoverProcess={hoverProcess}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <LayerSection
          layerId="ai"
          elements={byLayer('ai')}
          delay={0.08}
          grow
          highlightedElementIds={highlightedElementIds}
          onHoverElement={hoverElement}
        />
        <LayerSection
          layerId="data"
          elements={byLayer('data')}
          delay={0.14}
          highlightedElementIds={highlightedElementIds}
          onHoverElement={hoverElement}
        />
        <LayerSection
          layerId="apps"
          elements={byLayer('apps')}
          delay={0.2}
          grow
          highlightedElementIds={highlightedElementIds}
          onHoverElement={hoverElement}
        />
      </div>

      {mode === 'technical' && (
        <p className="shrink-0 text-center text-slide-caption text-mist">
          {isHovering
            ? 'Hover links processes ↔ layer elements by color.'
            : 'Hover a process or element to see connections.'}
        </p>
      )}
    </div>
  );
}
