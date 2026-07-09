import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { systemById } from '../data/systems';
import {
  FACTORY_MAPPABLE_SYSTEMS,
  FACTORY_ZONES,
  type FactoryZoneId,
} from '../data/factoryLayout';
import { ACCENT_HEX } from '../data/brand';

export function FactoryConfigModal() {
  const open = useStore((s) => s.factoryConfigOpen);
  const factoryMapping = useStore((s) => s.factoryMapping);
  const closeFactoryConfig = useStore((s) => s.closeFactoryConfig);
  const setSystemZones = useStore((s) => s.setSystemZones);
  const resetFactoryMapping = useStore((s) => s.resetFactoryMapping);

  const toggleZone = (systemId: string, zoneId: FactoryZoneId) => {
    const current = factoryMapping[systemId] ?? [];
    const next = current.includes(zoneId)
      ? current.filter((z) => z !== zoneId)
      : [...current, zoneId];
    setSystemZones(systemId, next);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="factory-config"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm"
          onClick={closeFactoryConfig}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-navy-900/95 shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="flex items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="font-display text-xl text-paper">
                  Factory system mapping
                </h2>
                <p className="mt-1 text-sm text-mist">
                  Connect each system to one or more factory zones. Changes apply
                  immediately on the factory scene.
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={resetFactoryMapping}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist transition hover:border-white/20 hover:text-paper"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={closeFactoryConfig}
                  className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-mist transition hover:border-white/20 hover:text-paper"
                >
                  Close
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-5">
                {FACTORY_MAPPABLE_SYSTEMS.map((systemId) => {
                  const sys = systemById[systemId];
                  const accent = ACCENT_HEX[sys.accent];
                  const mapped = factoryMapping[systemId] ?? [];

                  return (
                    <div
                      key={systemId}
                      className="rounded-xl border border-white/8 bg-ink/40 p-4"
                    >
                      <div className="mb-3 flex items-baseline gap-2">
                        <span
                          className="text-sm font-semibold"
                          style={{ color: accent }}
                        >
                          {sys.short}
                        </span>
                        <span className="text-xs text-mist">{sys.name}</span>
                        <span className="ml-auto text-[10px] uppercase tracking-wider text-mist/70">
                          {sys.owner}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {FACTORY_ZONES.map((zone) => {
                          const active = mapped.includes(zone.id);
                          return (
                            <button
                              key={zone.id}
                              type="button"
                              onClick={() => toggleZone(systemId, zone.id)}
                              className="rounded-full border px-3 py-1 text-xs font-medium transition"
                              style={{
                                borderColor: active ? accent : 'rgba(255,255,255,0.12)',
                                background: active ? `${accent}22` : 'transparent',
                                color: active ? accent : '#9DB4CC',
                              }}
                            >
                              {zone.label}
                            </button>
                          );
                        })}
                      </div>

                      {mapped.length === 0 && (
                        <p className="mt-2 text-[11px] text-mist/60">
                          No zones selected — system hidden from the factory scene.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
