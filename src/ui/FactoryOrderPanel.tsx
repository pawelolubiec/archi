import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  FACTORY_ACTIVE_SYSTEMS,
  FACTORY_LINK_COLORS,
  FACTORY_ORDER_COPY,
  FACTORY_SYSTEM_LINKS,
  type FactoryOrderView,
} from '../data/factoryTopology';

const VIEW_META: Record<FactoryOrderView, { label: string; accent: string }> = {
  asis: { label: 'As is', accent: '#2EC5C5' },
  tobe: { label: 'To be', accent: '#D6BF91' },
};

export function FactoryOrderPanel() {
  const view = useStore((s) => s.factoryOrderView);
  const setView = useStore((s) => s.setFactoryOrderView);
  const links = FACTORY_SYSTEM_LINKS[view];

  return (
    <div className="pointer-events-auto w-[min(28rem,90vw)]">
      <div className="rounded-2xl border border-white/10 bg-navy-900/90 p-5 shadow-panel backdrop-blur-md">
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2 rounded-full border border-white/10 bg-ink/40 p-1">
            {(Object.keys(VIEW_META) as FactoryOrderView[]).map((v) => {
              const selected = view === v;
              const meta = VIEW_META[v];
              return (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className="rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition"
                  style={{
                    background: selected ? `${meta.accent}18` : 'transparent',
                    color: selected ? meta.accent : '#9DB4CC',
                    boxShadow: selected ? `0 0 0 1px ${meta.accent}44` : undefined,
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
              className="text-center"
            >
              <p className="text-sm font-medium text-paper">
                {FACTORY_ORDER_COPY[view].headline}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-mist">
                {FACTORY_ORDER_COPY[view].detail}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-4 border-t border-white/10 pt-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist/70">
            System links
          </div>
          <ul className="mt-2 space-y-1.5">
            {links.map((link) => (
              <li
                key={`${link.from}-${link.to}`}
                className="flex items-center gap-2 text-xs text-mist"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: FACTORY_LINK_COLORS[link.kind] }}
                />
                <span className="font-medium uppercase text-paper/90">
                  {link.from.replace(/_/g, ' ')}
                </span>
                <span className="text-mist/50">→</span>
                <span className="font-medium uppercase text-paper/90">
                  {link.to.replace(/_/g, ' ')}
                </span>
                <span className="ml-auto text-[10px] uppercase tracking-wider text-mist/60">
                  {link.kind}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-3 text-[11px] leading-relaxed text-mist/70">
          Active: {FACTORY_ACTIVE_SYSTEMS[view].join(', ').replace(/_/g, ' ')}
        </p>
      </div>
    </div>
  );
}
