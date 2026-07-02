import { motion, AnimatePresence } from 'framer-motion';
import { useActiveModal, useStore } from '../store/useStore';
import { systemById } from '../data/systems';
import { kpiById } from '../data/kpis';
import { ACCENT_HEX } from '../data/brand';
import type { SystemStatus } from '../data/types';

const STATUS_LABEL: Record<SystemStatus, string> = {
  live: 'Connected',
  planned: 'Planned',
  candidate: 'Candidate',
  core: 'Core',
};

const STATUS_COLOR: Record<SystemStatus, string> = {
  live: '#34D399',
  planned: '#2EC5C5',
  candidate: '#D6BF91',
  core: '#D6BF91',
};

export function SystemModal() {
  const modalId = useActiveModal();
  const closeModal = useStore((s) => s.closeModal);
  const mode = useStore((s) => s.mode);
  const sys = modalId ? systemById[modalId] : null;

  return (
    <AnimatePresence>
      {sys && (
        <motion.aside
          key={sys.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-auto w-[360px] rounded-2xl border border-white/10 bg-navy-900/80 p-6 shadow-panel backdrop-blur-md"
        >
          <div className="flex items-start justify-between">
            <div>
              <div
                className="text-xs uppercase tracking-[0.22em]"
                style={{ color: ACCENT_HEX[sys.accent] }}
              >
                {sys.short}
              </div>
              <h2 className="mt-1 font-display text-2xl text-paper">{sys.name}</h2>
              <div className="mt-1 text-xs text-mist">Owner: {sys.owner}</div>
            </div>
            <button
              onClick={closeModal}
              className="rounded-full border border-white/10 px-2 py-1 text-xs text-mist transition hover:text-paper"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
            style={{ borderColor: `${STATUS_COLOR[sys.status]}55`, color: STATUS_COLOR[sys.status] }}>
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[sys.status] }} />
            {STATUS_LABEL[sys.status]}
          </div>

          <p className="mt-4 text-sm leading-relaxed text-mist">{sys.description}</p>

          <button
            onClick={() => {
              useStore.getState().openApp(sys.id);
            }}
            className="mt-4 w-full rounded-lg border border-sea/40 bg-sea/10 px-4 py-2.5 text-sm font-medium text-sea transition hover:bg-sea/20"
          >
            View app — screenshot ↗
          </button>

          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-mist">
              Responsibilities
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {sys.responsibilities.map((r) => (
                <li key={r} className="flex items-center gap-2 text-sm text-paper/85">
                  <span
                    className="h-1 w-1 rounded-full"
                    style={{ background: ACCENT_HEX[sys.accent] }}
                  />
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5">
            <div className="text-[10px] uppercase tracking-[0.22em] text-mist">
              KPI impact
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {sys.businessKPIs.map((kid) => (
                <span
                  key={kid}
                  className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-paper/80"
                >
                  {kpiById[kid]?.name ?? kid}
                </span>
              ))}
            </div>
          </div>

          {mode === 'technical' && sys.connectedTo.length > 0 && (
            <div className="mt-5">
              <div className="text-[10px] uppercase tracking-[0.22em] text-mist">
                Integrations
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {sys.connectedTo.map((cid) => (
                  <span
                    key={cid}
                    className="rounded-md border border-sea/20 bg-sea/5 px-2 py-1 text-xs text-sea"
                  >
                    {systemById[cid]?.short ?? cid}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
