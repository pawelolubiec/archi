import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { systems } from '../data/systems';
import {
  ARCH_LAYER_LABELS,
  BUSINESS_PROCESSES,
  type ArchLayerId,
  type ArchitectureElement,
} from '../data/architectureLayout';

const LAYER_ORDER: ArchLayerId[] = ['ai', 'data', 'apps'];

function ElementRow({
  element,
  onLabelChange,
  onToggleProcess,
  onSystemChange,
  onDelete,
}: {
  element: ArchitectureElement;
  onLabelChange: (label: string) => void;
  onToggleProcess: (processId: string) => void;
  onSystemChange: (systemId: string | undefined) => void;
  onDelete: () => void;
}) {
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
    </div>
  );
}

function LayerSection({
  layerId,
  elements,
  onAdd,
  onUpdate,
  onDelete,
  onToggleProcess,
}: {
  layerId: ArchLayerId;
  elements: ArchitectureElement[];
  onAdd: () => void;
  onUpdate: (id: string, patch: Partial<ArchitectureElement>) => void;
  onDelete: (id: string) => void;
  onToggleProcess: (id: string, processId: string) => void;
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
            onLabelChange={(label) => onUpdate(el.id, { label })}
            onSystemChange={(systemId) => onUpdate(el.id, { systemId })}
            onDelete={() => onDelete(el.id)}
            onToggleProcess={(processId) => onToggleProcess(el.id, processId)}
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
  const resetArchitectureConfig = useStore((s) => s.resetArchitectureConfig);

  const toggleProcess = (elementId: string, processId: string) => {
    const el = config.elements.find((e) => e.id === elementId);
    if (!el) return;
    const next = el.linkedProcessIds.includes(processId)
      ? el.linkedProcessIds.filter((id) => id !== processId)
      : [...el.linkedProcessIds, processId];
    setElementProcessLinks(elementId, next);
  };

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
                  Add elements to each layer and link them to business processes.
                  Changes apply immediately on the architecture slide.
                </p>
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
                    elements={config.elements.filter((el) => el.layer === layerId)}
                    onAdd={() => addArchitectureElement(layerId, 'New item')}
                    onUpdate={(id, patch) => updateArchitectureElement(id, patch)}
                    onDelete={removeArchitectureElement}
                    onToggleProcess={toggleProcess}
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
