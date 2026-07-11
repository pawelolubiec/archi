import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  ARCH_LAYER_LABELS,
  BUSINESS_PROCESSES,
  LAYER_RANK,
  connectedElementIds,
  formatProcessBadges,
  getProcessColor,
  primaryProcessColor,
  type ArchLayerId,
  type ArchitectureElement,
} from '../data/architectureLayout';

/** How data travels up the stack — shown at the right of each layer header. */
const LAYER_FLOW_HINTS: Record<ArchLayerId, string> = {
  ai: 'decisions & automation support every app ↓',
  data: '↑ features, KPIs & signals feed decisions',
  apps: '↑ operational data feeds the platform',
};

interface FlowLine {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
}

function ProcessChevron({
  proc,
  index,
  isFirst,
  isLast,
  highlighted,
  dimmed,
  onHover,
  nodeRef,
}: {
  proc: (typeof BUSINESS_PROCESSES)[number];
  index: number;
  isFirst: boolean;
  isLast: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onHover: () => void;
  nodeRef: (node: HTMLElement | null) => void;
}) {
  return (
    <motion.div
      ref={nodeRef}
      initial={{ opacity: 0, y: -6 }}
      animate={{
        opacity: dimmed ? 0.28 : 1,
        y: 0,
        scale: highlighted ? 1.06 : 1,
      }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onMouseEnter={onHover}
      className="flex min-h-[2.25rem] cursor-pointer items-center justify-center px-1 py-1 text-center transition-shadow"
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
  registerNode,
}: {
  highlightedProcessIds: Set<string>;
  onHoverProcess: (id: string) => void;
  registerNode: (key: string) => (node: HTMLElement | null) => void;
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
              nodeRef={registerNode(`proc:${proc.id}`)}
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
  nodeRef,
}: {
  element: ArchitectureElement;
  index: number;
  compact?: boolean;
  highlighted: boolean;
  dimmed: boolean;
  onHover: () => void;
  nodeRef: (node: HTMLElement | null) => void;
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
        ref={nodeRef}
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
      ref={nodeRef}
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
  registerNode,
}: {
  layerId: ArchLayerId;
  elements: ArchitectureElement[];
  delay: number;
  grow?: boolean;
  highlightedElementIds: Set<string>;
  onHoverElement: (id: string) => void;
  registerNode: (key: string) => (node: HTMLElement | null) => void;
}) {
  if (!elements.length) return null;

  const isFiltering = highlightedElementIds.size > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`flex flex-col rounded-xl border border-white/10 bg-navy-900/75 px-4 py-2.5 backdrop-blur-md ${
        grow ? 'min-h-0 flex-1' : 'shrink-0'
      }`}
    >
      <div className="mb-2 flex shrink-0 items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-sea lg:text-base">
          {ARCH_LAYER_LABELS[layerId]}
        </span>
        <span className="hidden text-xs text-mist/60 md:block">
          {LAYER_FLOW_HINTS[layerId]}
        </span>
      </div>
      <div
        className={`flex flex-wrap gap-2 ${
          grow ? 'min-h-0 flex-1 content-center overflow-y-auto' : 'content-start'
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
              nodeRef={registerNode(el.id)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

export function ArchitectureLayers() {
  const elements = useStore((s) => s.architectureConfig.elements);
  const [hoveredProcessId, setHoveredProcessId] = useState<string | null>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [flowLines, setFlowLines] = useState<FlowLine[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const nodeMap = useRef(new Map<string, HTMLElement>());
  const registerNode = (key: string) => (node: HTMLElement | null) => {
    if (node) nodeMap.current.set(key, node);
    else nodeMap.current.delete(key);
  };

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
      if (!el) {
        return {
          highlightedProcessIds: new Set<string>(),
          highlightedElementIds: new Set<string>(),
        };
      }
      const ids = new Set([el.id, ...connectedElementIds(el, elements)]);
      return {
        highlightedProcessIds: new Set(el.linkedProcessIds),
        highlightedElementIds: ids,
      };
    }

    return {
      highlightedProcessIds: new Set<string>(),
      highlightedElementIds: new Set<string>(),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredProcessId, hoveredElementId, elements, elementById]);

  /** Line factory measuring chip positions relative to the container. */
  const makeMeasurer = useCallback(() => {
    const container = containerRef.current;
    if (!container) return null;
    const cRect = container.getBoundingClientRect();
    const rectOf = (key: string) => {
      const n = nodeMap.current.get(key);
      if (!n) return null;
      const r = n.getBoundingClientRect();
      return {
        top: r.top - cRect.top,
        bottom: r.bottom - cRect.top,
        cx: r.left - cRect.left + r.width / 2,
      };
    };
    // from a lower node's top edge up to an upper node's bottom edge
    return (fromKey: string, toKey: string, color: string): FlowLine | null => {
      const a = rectOf(fromKey);
      const b = rectOf(toKey);
      if (!a || !b) return null;
      return { key: `${fromKey}->${toKey}`, x1: a.cx, y1: a.top, x2: b.cx, y2: b.bottom, color };
    };
  }, []);

  // Measure chip positions and build the flow connectors around the hovered node.
  useLayoutEffect(() => {
    const mk = makeMeasurer();
    if (!mk) {
      setFlowLines([]);
      return;
    }

    const lines = new Map<string, FlowLine>();
    const add = (l: FlowLine | null) => {
      if (l) lines.set(l.key, l);
    };

    const el = hoveredElementId ? elementById[hoveredElementId] : null;
    if (el) {
      const color = primaryProcessColor(el.linkedProcessIds);
      connectedElementIds(el, elements).forEach((id) => {
        const other = elementById[id];
        if (!other) return;
        const diff = LAYER_RANK[other.layer] - LAYER_RANK[el.layer];
        if (diff > 0) add(mk(el.id, other.id, color));
        else if (diff < 0) add(mk(other.id, el.id, color));
        // complete the chain: connected AI elements reach the process strip
        if (other.layer === 'ai') {
          other.linkedProcessIds
            .filter((pid) => el.linkedProcessIds.includes(pid))
            .forEach((pid) =>
              add(mk(other.id, `proc:${pid}`, getProcessColor(pid))),
            );
        }
      });
      if (el.layer === 'ai') {
        el.linkedProcessIds.forEach((pid) =>
          add(mk(el.id, `proc:${pid}`, getProcessColor(pid))),
        );
      }
    } else if (hoveredProcessId) {
      const color = getProcessColor(hoveredProcessId);
      elements
        .filter((o) => o.linkedProcessIds.includes(hoveredProcessId))
        .forEach((o) => add(mk(o.id, `proc:${hoveredProcessId}`, color)));
    }

    setFlowLines([...lines.values()]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hoveredElementId, hoveredProcessId, elements, elementById, makeMeasurer]);

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
      ref={containerRef}
      className="pointer-events-auto relative flex h-full w-full flex-col gap-2"
      onMouseLeave={() => {
        setHoveredProcessId(null);
        setHoveredElementId(null);
      }}
    >
      <ProcessStrip
        highlightedProcessIds={highlightedProcessIds}
        onHoverProcess={hoverProcess}
        registerNode={registerNode}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-2">
        <LayerSection
          layerId="ai"
          elements={byLayer('ai')}
          delay={0.08}
          grow
          highlightedElementIds={highlightedElementIds}
          onHoverElement={hoverElement}
          registerNode={registerNode}
        />
        <LayerSection
          layerId="data"
          elements={byLayer('data')}
          delay={0.14}
          highlightedElementIds={highlightedElementIds}
          onHoverElement={hoverElement}
          registerNode={registerNode}
        />
        <LayerSection
          layerId="apps"
          elements={byLayer('apps')}
          delay={0.2}
          grow
          highlightedElementIds={highlightedElementIds}
          onHoverElement={hoverElement}
          registerNode={registerNode}
        />
      </div>

      {/* flow connectors around the hovered node */}
      {flowLines.length > 0 && (
        <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible">
          {flowLines.map((l) => {
            const midY = (l.y1 + l.y2) / 2;
            return (
              <g key={l.key}>
                <path
                  d={`M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`}
                  fill="none"
                  stroke={l.color}
                  strokeWidth={1.5}
                  strokeDasharray="6 6"
                  opacity={0.75}
                  style={{ animation: 'arch-flow 0.7s linear infinite' }}
                />
                <circle cx={l.x2} cy={l.y2} r={2.5} fill={l.color} opacity={0.9} />
              </g>
            );
          })}
        </svg>
      )}

      <p className="shrink-0 text-center text-xs text-mist/80">
        {isHovering
          ? 'Dashed lines show the connections — operational data travels up, decision support flows down.'
          : 'Hover any element or process to see its connections — apps feed data, data feeds AI, AI supports decisions.'}
      </p>
    </div>
  );
}
