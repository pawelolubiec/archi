import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  ARCH_LAYER_LABELS,
  ARCH_VIEW_COPY,
  BUSINESS_PROCESSES,
  CONNECTION_KIND_META,
  ELEMENT_STATUS_META,
  LAYER_RANK,
  connectionsForView,
  elementStatus,
  formatProcessBadges,
  getProcessColor,
  primaryProcessColor,
  type ArchLayerId,
  type ArchitectureElement,
  type ConnectionKind,
} from '../data/architectureLayout';

type ArchView = 'asis' | 'tobe';

const VIEW_META: Record<ArchView, { label: string; accent: string }> = {
  asis: { label: 'As is', accent: '#2EC5C5' },
  tobe: { label: 'To be', accent: '#D6BF91' },
};

const LAYER_FLOW_HINTS: Record<ArchLayerId, string> = {
  ai: 'decisions & automation support every app ↓',
  data: '↑ features, KPIs & signals feed decisions',
  apps: '↑ operational data feeds the platform',
};

interface FlowLine {
  key: string;
  fromKey: string;
  toKey: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  fromLeft: number;
  fromRight: number;
  toLeft: number;
  toRight: number;
  color: string;
  dash: string;
  kind: ConnectionKind;
}

function distributeLinePorts(lines: FlowLine[]): FlowLine[] {
  const distributed = lines.map((line) => ({ ...line }));

  const spread = (endpoint: 'from' | 'to') => {
    const groups = new Map<string, FlowLine[]>();
    distributed.forEach((line) => {
      const nodeKey = endpoint === 'from' ? line.fromKey : line.toKey;
      const y = endpoint === 'from' ? line.y1 : line.y2;
      const key = `${nodeKey}:${Math.round(y)}`;
      groups.set(key, [...(groups.get(key) ?? []), line]);
    });

    groups.forEach((group) => {
      group.sort((a, b) =>
        endpoint === 'from' ? a.x2 - b.x2 : a.x1 - b.x1,
      );
      group.forEach((line, index) => {
        const left = endpoint === 'from' ? line.fromLeft : line.toLeft;
        const right = endpoint === 'from' ? line.fromRight : line.toRight;
        const padding = Math.min(10, (right - left) * 0.15);
        const min = left + padding;
        const max = right - padding;
        const x = min + ((index + 1) / (group.length + 1)) * (max - min);
        if (endpoint === 'from') line.x1 = x;
        else line.x2 = x;
      });
    });
  };

  spread('from');
  spread('to');
  return distributed;
}

function ArchViewSwitch({
  view,
  onChange,
}: {
  view: ArchView;
  onChange: (v: ArchView) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="pointer-events-auto flex gap-2 rounded-full border border-white/10 bg-navy-900/80 p-1.5 shadow-panel backdrop-blur-md">
        {(Object.keys(VIEW_META) as ArchView[]).map((v) => {
          const selected = view === v;
          const meta = VIEW_META[v];
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className="rounded-full px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.12em] transition"
              style={{
                borderColor: selected ? `${meta.accent}cc` : 'transparent',
                background: selected ? `${meta.accent}18` : 'transparent',
                color: selected ? meta.accent : '#9DB4CC',
                boxShadow: selected
                  ? `0 0 0 1px ${meta.accent}44, 0 0 24px -6px ${meta.accent}88`
                  : undefined,
              }}
            >
              {meta.label}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="max-w-2xl text-center"
        >
          <p className="text-sm font-medium text-paper">{ARCH_VIEW_COPY[view].headline}</p>
          <p className="mt-1 text-xs leading-relaxed text-mist/85">
            {ARCH_VIEW_COPY[view].detail}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
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
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-slide-caption font-semibold uppercase tracking-[0.18em] text-mist">
          Business Process Layer
        </span>
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
  ghosted = false,
  showStatus = false,
  onHover,
  nodeRef,
}: {
  element: ArchitectureElement;
  index: number;
  compact?: boolean;
  highlighted: boolean;
  dimmed: boolean;
  ghosted?: boolean;
  showStatus?: boolean;
  onHover: () => void;
  nodeRef: (node: HTMLElement | null) => void;
}) {
  const color = primaryProcessColor(element.linkedProcessIds);
  const badges = formatProcessBadges(element.linkedProcessIds);
  const status = elementStatus(element);
  const statusMeta = ELEMENT_STATUS_META[status];
  const openApp = useStore((s) => s.openApp);

  const baseClass = compact
    ? 'inline-flex items-center gap-1.5 rounded-md border bg-white/5 px-3 py-1.5 text-slide-caption'
    : 'inline-flex items-center gap-2 rounded-lg border bg-white/5 px-3 py-1.5 text-sm lg:text-base';

  const inner = (
    <>
      {showStatus && (
        <span
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          title={statusMeta.label}
          style={
            status === 'todo'
              ? { border: `1px solid ${statusMeta.color}` }
              : { background: statusMeta.color }
          }
        />
      )}
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

  const opacity = ghosted ? 0.15 : dimmed ? 0.28 : 1;

  const style = {
    borderColor: ghosted
      ? 'rgba(157,180,204,0.4)'
      : highlighted
        ? color
        : `${color}99`,
    borderLeftWidth: '3px',
    boxShadow: ghosted
      ? undefined
      : highlighted
        ? `0 0 0 1px ${color}, 0 0 32px -6px ${color}`
        : `0 0 24px -12px ${color}77`,
    opacity,
    transform: highlighted ? 'scale(1.04)' : undefined,
  };

  const hoverHandlers = ghosted ? {} : { onMouseEnter: onHover };

  if (element.systemId && !ghosted) {
    return (
      <motion.button
        ref={nodeRef}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity, scale: highlighted ? 1.04 : 1 }}
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
      animate={{ opacity, scale: highlighted ? 1.04 : 1 }}
      transition={{ delay: 0.1 + index * 0.03, duration: 0.2 }}
      className={`${baseClass} ${ghosted ? '' : 'cursor-pointer'}`}
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
  view,
  highlightedElementIds,
  onHoverElement,
  registerNode,
}: {
  layerId: ArchLayerId;
  elements: ArchitectureElement[];
  delay: number;
  grow?: boolean;
  view: ArchView;
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
          const ghosted = view === 'asis' && elementStatus(el) !== 'live';
          return (
            <ElementChip
              key={el.id}
              element={el}
              index={i}
              compact={layerId === 'data'}
              highlighted={highlighted}
              dimmed={dimmed}
              ghosted={ghosted}
              showStatus={view === 'tobe'}
              onHover={() => onHoverElement(el.id)}
              nodeRef={registerNode(el.id)}
            />
          );
        })}
      </div>
    </motion.div>
  );
}

function ConnectionLegend({ kinds }: { kinds: ConnectionKind[] }) {
  const unique = [...new Set(kinds)];
  if (!unique.length) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
      {unique.map((kind) => {
        const meta = CONNECTION_KIND_META[kind];
        return (
          <span key={kind} className="inline-flex items-center gap-1.5 text-[11px] text-mist/80">
            <svg width="20" height="6" aria-hidden>
              <line
                x1="0"
                y1="3"
                x2="20"
                y2="3"
                stroke={meta.color}
                strokeWidth="2"
                strokeDasharray={meta.dash}
              />
            </svg>
            {meta.label}
          </span>
        );
      })}
    </div>
  );
}

export function ArchitectureLayers() {
  const architectureConfig = useStore((s) => s.architectureConfig);
  const elements = architectureConfig.elements;
  const [view, setView] = useState<ArchView>('asis');
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

  const visibleElements = useMemo(
    () =>
      view === 'asis'
        ? elements.filter((el) => elementStatus(el) === 'live')
        : elements,
    [elements, view],
  );

  const viewConnections = useMemo(
    () => connectionsForView(architectureConfig, view),
    [architectureConfig, view],
  );
  const connectedIdsByElement = useMemo(() => {
    const result = new Map<string, Set<string>>();
    const add = (fromId: string, toId: string) => {
      const ids = result.get(fromId) ?? new Set<string>();
      ids.add(toId);
      result.set(fromId, ids);
    };
    viewConnections.forEach((connection) => {
      add(connection.fromId, connection.toId);
      add(connection.toId, connection.fromId);
    });
    return result;
  }, [viewConnections]);
  const visibleElementIds = useMemo(
    () => new Set(visibleElements.map((element) => element.id)),
    [visibleElements],
  );

  const otherViewConnections = useMemo(
    () => connectionsForView(architectureConfig, view === 'asis' ? 'tobe' : 'asis'),
    [architectureConfig, view],
  );

  const diffKinds = useMemo(() => {
    const currentKeys = new Set(
      viewConnections.map((c) => [c.fromId, c.toId].sort().join('|')),
    );
    const otherKeys = new Set(
      otherViewConnections.map((c) => [c.fromId, c.toId].sort().join('|')),
    );
    const upgraded = viewConnections.filter(
      (c) => !otherKeys.has([c.fromId, c.toId].sort().join('|')),
    );
    const downgraded = otherViewConnections.filter(
      (c) => !currentKeys.has([c.fromId, c.toId].sort().join('|')),
    );
    return { upgraded, downgraded };
  }, [viewConnections, otherViewConnections]);

  const { highlightedProcessIds, highlightedElementIds } = useMemo(() => {
    if (hoveredProcessId) {
      const connected = visibleElements
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
      const connectedIds = [...(connectedIdsByElement.get(el.id) ?? [])].filter(
        (id) => visibleElementIds.has(id),
      );
      const ids = new Set([
        el.id,
        ...connectedIds,
      ]);
      return {
        highlightedProcessIds: new Set(el.linkedProcessIds),
        highlightedElementIds: ids,
      };
    }

    return {
      highlightedProcessIds: new Set<string>(),
      highlightedElementIds: new Set<string>(),
    };
  }, [
    hoveredProcessId,
    hoveredElementId,
    visibleElements,
    visibleElementIds,
    elementById,
    connectedIdsByElement,
  ]);

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
        left: r.left - cRect.left,
        right: r.right - cRect.left,
        cx: r.left - cRect.left + r.width / 2,
      };
    };
    return (
      fromKey: string,
      toKey: string,
      color: string,
      dash: string,
      kind: ConnectionKind,
    ): FlowLine | null => {
      const a = rectOf(fromKey);
      const b = rectOf(toKey);
      if (!a || !b) return null;
      const upward = a.top > b.top;
      return {
        key: `${fromKey}->${toKey}`,
        fromKey,
        toKey,
        x1: a.cx,
        y1: upward ? a.top : a.bottom,
        x2: b.cx,
        y2: upward ? b.bottom : b.top,
        fromLeft: a.left,
        fromRight: a.right,
        toLeft: b.left,
        toRight: b.right,
        color,
        dash,
        kind,
      };
    };
  }, [elementById]);

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
      [...(connectedIdsByElement.get(el.id) ?? [])]
        .filter((id) => visibleElementIds.has(id))
        .forEach((id) => {
        const other = elementById[id];
        if (!other) return;
        const diff = LAYER_RANK[other.layer] - LAYER_RANK[el.layer];
        if (diff > 0) add(mk(el.id, other.id, color, '6 6', 'standard'));
        else if (diff < 0) add(mk(other.id, el.id, color, '6 6', 'standard'));
        });
      el.linkedProcessIds.forEach((pid) =>
        add(mk(el.id, `proc:${pid}`, getProcessColor(pid), '6 6', 'standard')),
      );
    } else if (hoveredProcessId) {
      const color = getProcessColor(hoveredProcessId);
      visibleElements
        .filter((o) => o.linkedProcessIds.includes(hoveredProcessId))
        .forEach((o) => add(mk(o.id, `proc:${hoveredProcessId}`, color, '6 6', 'standard')));
    }

    setFlowLines(distributeLinePorts([...lines.values()]));
  }, [
    hoveredElementId,
    hoveredProcessId,
    visibleElements,
    visibleElementIds,
    elementById,
    connectedIdsByElement,
    makeMeasurer,
    view,
  ]);

  const hoverProcess = (id: string) => {
    setHoveredProcessId(id);
    setHoveredElementId(null);
  };

  const hoverElement = (id: string) => {
    setHoveredElementId(id);
    setHoveredProcessId(null);
  };

  const byLayer = (layer: ArchLayerId) => elements.filter((el) => el.layer === layer);

  const isHovering = hoveredProcessId !== null || hoveredElementId !== null;
  const legendKinds = viewConnections.map((c) => c.kind);

  const renderLines = (lines: FlowLine[], opacity: number, animate: boolean) =>
    lines.map((l) => {
      const midY = (l.y1 + l.y2) / 2;
      return (
        <g key={l.key} opacity={opacity}>
          <path
            d={`M ${l.x1} ${l.y1} C ${l.x1} ${midY}, ${l.x2} ${midY}, ${l.x2} ${l.y2}`}
            fill="none"
            stroke={l.color}
            strokeWidth={1.5}
            strokeDasharray={l.dash}
            style={animate ? { animation: 'arch-flow 0.7s linear infinite' } : undefined}
          />
          <circle cx={l.x2} cy={l.y2} r={2} fill={l.color} opacity={0.85} />
        </g>
      );
    });

  return (
    <div
      ref={containerRef}
      className="pointer-events-auto relative flex h-full w-full flex-col gap-2"
      onMouseLeave={() => {
        setHoveredProcessId(null);
        setHoveredElementId(null);
      }}
    >
      <div className="fixed left-1/2 top-4 z-30 -translate-x-1/2">
        <ArchViewSwitch view={view} onChange={setView} />
      </div>

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
          view={view}
          highlightedElementIds={highlightedElementIds}
          onHoverElement={hoverElement}
          registerNode={registerNode}
        />
        <LayerSection
          layerId="data"
          elements={byLayer('data')}
          delay={0.14}
          view={view}
          highlightedElementIds={highlightedElementIds}
          onHoverElement={hoverElement}
          registerNode={registerNode}
        />
        <LayerSection
          layerId="apps"
          elements={byLayer('apps')}
          delay={0.2}
          grow
          view={view}
          highlightedElementIds={highlightedElementIds}
          onHoverElement={hoverElement}
          registerNode={registerNode}
        />
      </div>

      {flowLines.length > 0 && (
        <svg className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible">
          {renderLines(flowLines, 0.85, true)}
        </svg>
      )}

      <div className="shrink-0 space-y-1.5 pt-1">
        <ConnectionLegend kinds={legendKinds} />
        <p className="text-center text-xs text-mist/80">
          {isHovering ? (
            'Dashed lines show the connections — operational data travels up, decision support flows down.'
          ) : view === 'tobe' ? (
            <>
              {(['live', 'in_dev', 'todo'] as const).map((s, i) => (
                <span key={s} className="whitespace-nowrap">
                  {i > 0 && <span className="mx-2 text-mist/40">·</span>}
                  <span
                    className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle"
                    style={
                      s === 'todo'
                        ? { border: `1px solid ${ELEMENT_STATUS_META[s].color}` }
                        : { background: ELEMENT_STATUS_META[s].color }
                    }
                  />
                  {ELEMENT_STATUS_META[s].label}
                </span>
              ))}
              {diffKinds.upgraded.length > 0 && (
                <span className="mt-1 block text-mist/70">
                  {diffKinds.upgraded.length} new or standardized links vs as-is
                </span>
              )}
            </>
          ) : (
            <>
              Only running systems are shown.{' '}
              {diffKinds.downgraded.length > 0 && (
                <span className="text-mist/70">
                  {diffKinds.downgraded.length} links upgrade when you switch to To be.
                </span>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
