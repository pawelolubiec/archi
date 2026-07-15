import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { systems } from '../data/systems';
import {
  ARCH_LAYER_LABELS,
  BUSINESS_PROCESSES,
  CONNECTION_KIND_META,
  ELEMENT_STATUS_META,
  connectedElementIds,
  connectionsForView,
  elementStatus,
  type ArchLayerId,
  type ArchitectureElement,
  type ElementStatus,
} from '../data/architectureLayout';

const STATUS_ORDER: ElementStatus[] = ['todo', 'in_dev', 'live'];
import { SaveStatus } from './ConfigSaveStatus';

const LAYER_ORDER: ArchLayerId[] = ['ai', 'data', 'apps'];

function ConnectionsEditor({
  element,
  allElements,
  configView,
  onToggleConnection,
}: {
  element: ArchitectureElement;
  allElements: ArchitectureElement[];
  configView: 'asis' | 'tobe';
  onToggleConnection: (otherId: string) => void;
}) {
  const connected = connectedElementIds(element, allElements, configView);

  return (
    <div className="mt-2 space-y-1.5 border-t border-white/5 pt-2">
      {LAYER_ORDER.filter((layer) =>
        allElements.some((o) => o.layer === layer && o.id !== element.id),
      ).map((layer) => (
        <div key={layer} className="flex flex-wrap items-baseline gap-1.5">
          <span className="w-24 shrink-0 text-[10px] uppercase tracking-[0.14em] text-mist/60">
            {layer === 'ai' ? 'AI layer' : layer === 'data' ? 'Data' : 'Apps'}
          </span>
          {allElements
            .filter((o) => o.layer === layer && o.id !== element.id)
            .map((o) => {
              const active = connected.has(o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onToggleConnection(o.id)}
                  className="rounded-full border px-2 py-0.5 text-[10px] font-medium transition"
                  style={{
                    borderColor: active ? '#2EC5C5' : 'rgba(255,255,255,0.12)',
                    background: active ? 'rgba(46,197,197,0.15)' : 'transparent',
                    color: active ? '#2EC5C5' : '#9DB4CC',
                  }}
                >
                  {o.label}
                </button>
              );
            })}
        </div>
      ))}
      {(element.linkedElementIds === undefined &&
        element.linkedElementIdsAsIs === undefined &&
        element.linkedElementIdsToBe === undefined) && (
        <p className="text-[10px] text-mist/50">
          Currently derived from shared processes for {configView} — toggling pins
          the list for this element in that view.
        </p>
      )}
    </div>
  );
}

function ElementRow({
  element,
  allElements,
  configView,
  onLabelChange,
  onToggleProcess,
  onSystemChange,
  onToggleConnection,
  onStatusChange,
  onDelete,
}: {
  element: ArchitectureElement;
  allElements: ArchitectureElement[];
  configView: 'asis' | 'tobe';
  onLabelChange: (label: string) => void;
  onToggleProcess: (processId: string) => void;
  onSystemChange: (systemId: string | undefined) => void;
  onToggleConnection: (otherId: string) => void;
  onStatusChange: (status: ElementStatus) => void;
  onDelete: () => void;
}) {
  const [showConnections, setShowConnections] = useState(false);
  const connectionCount = connectedElementIds(element, allElements, configView).size;
  const status = elementStatus(element);

  return (
    <div className="rounded-lg border border-white/8 bg-ink/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        <input
          type="text"
          value={element.label}
          onChange={(e) => onLabelChange(e.target.value)}
          className="flex-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-sm text-paper outline-none focus:border-sea/50"
        />
        <select
          value={element.systemId ?? ''}
          onChange={(e) =>
            onSystemChange(e.target.value || undefined)
          }
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-mist outline-none focus:border-sea/50"
          title="Link to app preview"
        >
          <option value="">No app link</option>
          {systems.map((s) => (
            <option key={s.id} value={s.id}>
              {s.short}
            </option>
          ))}
        </select>
        <div
          className="flex overflow-hidden rounded-md border border-white/10"
          title="Delivery status — the strategy tick-off"
        >
          {STATUS_ORDER.map((s) => {
            const active = status === s;
            const meta = ELEMENT_STATUS_META[s];
            return (
              <button
                key={s}
                type="button"
                onClick={() => onStatusChange(s)}
                className="px-2 py-1 text-[10px] font-medium transition"
                style={{
                  background: active ? `${meta.color}22` : 'transparent',
                  color: active ? meta.color : '#9DB4CC77',
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setShowConnections((v) => !v)}
          className="rounded-md border border-white/10 px-2 py-1 text-xs text-mist transition hover:border-sea/40 hover:text-sea"
          title="Configure connections to other elements"
        >
          Links ({connectionCount}) {showConnections ? '▴' : '▾'}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-md border border-white/10 px-2 py-1 text-xs text-mist transition hover:border-red-400/40 hover:text-red-300"
        >
          Delete
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {BUSINESS_PROCESSES.map((proc) => {
          const active = element.linkedProcessIds.includes(proc.id);
          return (
            <button
              key={proc.id}
              type="button"
              onClick={() => onToggleProcess(proc.id)}
              className="rounded-full border px-2 py-0.5 text-[10px] font-medium transition"
              style={{
                borderColor: active ? proc.color : 'rgba(255,255,255,0.12)',
                background: active ? `${proc.color}33` : 'transparent',
                color: active ? proc.color : '#9DB4CC',
              }}
              title={proc.label}
            >
              {proc.order}
            </button>
          );
        })}
      </div>
      {showConnections && (
        <ConnectionsEditor
          element={element}
          allElements={allElements}
          configView={configView}
          onToggleConnection={onToggleConnection}
        />
      )}
    </div>
  );
}

function LayerSection({
  layerId,
  elements,
  allElements,
  configView,
  onAdd,
  onUpdate,
  onDelete,
  onToggleProcess,
  onToggleConnection,
}: {
  layerId: ArchLayerId;
  elements: ArchitectureElement[];
  allElements: ArchitectureElement[];
  configView: 'asis' | 'tobe';
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ArchitectureElement>) => void;
  onDelete: (id: string) => void;
  onToggleProcess: (id: string, processId: string) => void;
  onToggleConnection: (id: string, otherId: string) => void;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-sea">
          {ARCH_LAYER_LABELS[layerId]}
        </h3>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-md border border-white/10 px-2.5 py-1 text-xs text-mist transition hover:border-sea/40 hover:text-sea"
        >
          + Add item
        </button>
      </div>
      <div className="space-y-2">
        {elements.map((el) => (
          <ElementRow
            key={el.id}
            element={el}
            allElements={allElements}
            configView={configView}
            onLabelChange={(label) => onUpdate(el.id, { label })}
            onSystemChange={(systemId) => onUpdate(el.id, { systemId })}
            onStatusChange={(status) => onUpdate(el.id, { status })}
            onDelete={() => onDelete(el.id)}
            onToggleProcess={(processId) => onToggleProcess(el.id, processId)}
            onToggleConnection={(otherId) => onToggleConnection(el.id, otherId)}
          />
        ))}
        {!elements.length && (
          <p className="text-xs text-mist/60">No items in this layer.</p>
        )}
      </div>
    </section>
  );
}

export function ArchitectureConfigModal() {
  const open = useStore((s) => s.architectureConfigOpen);
  const config = useStore((s) => s.architectureConfig);
  const closeArchitectureConfig = useStore((s) => s.closeArchitectureConfig);
  const addArchitectureElement = useStore((s) => s.addArchitectureElement);
  const updateArchitectureElement = useStore((s) => s.updateArchitectureElement);
  const removeArchitectureElement = useStore((s) => s.removeArchitectureElement);
  const setElementProcessLinks = useStore((s) => s.setElementProcessLinks);
  const toggleArchitectureConnection = useStore((s) => s.toggleArchitectureConnection);
  const resetArchitectureConfig = useStore((s) => s.resetArchitectureConfig);
  const architectureSaveStatus = useStore((s) => s.architectureSaveStatus);
  const architectureSaveError = useStore((s) => s.architectureSaveError);
  const [configView, setConfigView] = useState<'asis' | 'tobe'>('tobe');

  const toggleProcess = (elementId: string, processId: string) => {
    const el = config.elements.find((e) => e.id === elementId);
    if (!el) return;
    const next = el.linkedProcessIds.includes(processId)
      ? el.linkedProcessIds.filter((id) => id !== processId)
      : [...el.linkedProcessIds, processId];
    setElementProcessLinks(elementId, next);
  };

  const toggleConnection = (elementId: string, otherId: string) => {
    toggleArchitectureConnection(configView, elementId, otherId);
  };

  const viewConnections = connectionsForView(config, configView);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="architecture-config"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm"
          onClick={closeArchitectureConfig}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900/95 shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="font-display text-xl text-paper">
                  Architecture layer mapping
                </h2>
                <p className="mt-1 text-sm text-mist">
                  Add elements to each layer, link them to business processes,
                  and configure connections between elements via “Links”.
                  Changes save to the shared database automatically.
                </p>
                <SaveStatus
                  status={architectureSaveStatus}
                  error={architectureSaveError}
                />
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={resetArchitectureConfig}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist transition hover:border-white/20 hover:text-paper"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={closeArchitectureConfig}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist transition hover:border-white/20 hover:text-paper"
                >
                  Close
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="mb-5 flex items-center justify-between gap-4">
                <span className="text-sm font-medium text-mist">
                  Edit connections for
                </span>
                <div className="flex gap-2">
                  {(['asis', 'tobe'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setConfigView(v)}
                      className="rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.08em] transition"
                      style={{
                        borderColor:
                          configView === v ? '#2EC5C5aa' : 'rgba(255,255,255,0.12)',
                        background:
                          configView === v ? 'rgba(46,197,197,0.12)' : 'transparent',
                        color: configView === v ? '#2EC5C5' : '#9DB4CC',
                      }}
                    >
                      {v === 'asis' ? 'As is' : 'To be'}
                    </button>
                  ))}
                </div>
              </div>

              <p className="mb-4 text-xs text-mist/70">
                {viewConnections.length} cross-layer links in{' '}
                {configView === 'asis' ? 'as-is' : 'to-be'} view. Use Links on each
                element or toggle pairs below.
              </p>

              <section className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-mist">
                  Business processes (fixed)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {BUSINESS_PROCESSES.map((proc) => (
                    <span
                      key={proc.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-paper/85"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: proc.color }}
                      />
                      <span className="font-medium">{proc.order}.</span>
                      {proc.label}
                    </span>
                  ))}
                </div>
              </section>

              <div className="space-y-6">
                {LAYER_ORDER.map((layerId) => (
                  <LayerSection
                    key={layerId}
                    layerId={layerId}
                    configView={configView}
                    elements={config.elements.filter((el) => el.layer === layerId)}
                    allElements={config.elements}
                    onAdd={() => addArchitectureElement(layerId, 'New item')}
                    onUpdate={(id, patch) => updateArchitectureElement(id, patch)}
                    onDelete={removeArchitectureElement}
                    onToggleProcess={toggleProcess}
                    onToggleConnection={toggleConnection}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
