import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
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

/**
 * Fullscreen app preview: large screenshot + "what it does" description.
 * Screenshots live in public/screens/{id}.png — replace with real 1:1 screenshots.
 */
export function AppModal() {
  const appId = useStore((s) => s.appModal);
  const closeApp = useStore((s) => s.closeApp);
  const sys = appId ? systemById[appId] : null;

  return (
    <AnimatePresence>
      {sys && (
        <motion.div
          key={sys.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm"
          onClick={closeApp}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex h-full max-h-[92vh] w-full max-w-[1500px] overflow-hidden rounded-2xl border border-white/10 bg-navy-900/95 shadow-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* screenshot */}
            <div className="relative flex min-w-0 flex-1 items-center justify-center bg-ink p-6">
              <img
                src={`/screens/${sys.id}.png`}
                alt={`Screenshot — ${sys.name}`}
                className="max-h-full w-auto max-w-full rounded-lg border border-white/10 object-contain shadow-panel"
              />
              <div
                className="pointer-events-none absolute inset-x-6 bottom-6 h-24 rounded-b-lg bg-gradient-to-t from-ink/70 to-transparent"
              />
            </div>

            {/* description */}
            <div className="thin-scroll flex w-[400px] shrink-0 flex-col overflow-y-auto border-l border-white/10 p-7">
              <div className="flex items-start justify-between">
                <div>
                  <div
                    className="text-xs uppercase tracking-[0.24em]"
                    style={{ color: ACCENT_HEX[sys.accent] }}
                  >
                    {sys.short}
                  </div>
                  <h2 className="mt-1 font-display text-3xl text-paper">
                    {sys.name}
                  </h2>
                  <div className="mt-1 text-xs text-mist">
                    Owner: {sys.owner}
                  </div>
                </div>
                <button
                  onClick={closeApp}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-sm text-mist transition hover:border-white/30 hover:text-paper"
                >
                  ✕
                </button>
              </div>

              <div
                className="mt-4 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs"
                style={{
                  borderColor: `${STATUS_COLOR[sys.status]}55`,
                  color: STATUS_COLOR[sys.status],
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: STATUS_COLOR[sys.status] }}
                />
                {STATUS_LABEL[sys.status]}
              </div>

              <div className="mt-5">
                <div className="text-[10px] uppercase tracking-[0.22em] text-mist">
                  What it does
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-paper/90">
                  {sys.description}
                </p>
              </div>

              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-[0.22em] text-mist">
                  Responsibilities
                </div>
                <ul className="mt-2 space-y-1.5">
                  {sys.responsibilities.map((r) => (
                    <li
                      key={r}
                      className="flex items-center gap-2.5 text-sm text-paper/85"
                    >
                      <span
                        className="h-1 w-1 shrink-0 rounded-full"
                        style={{ background: ACCENT_HEX[sys.accent] }}
                      />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-[0.22em] text-mist">
                  KPI impact
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sys.businessKPIs.map((kid) => (
                    <span
                      key={kid}
                      className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-paper/85"
                    >
                      {kpiById[kid]?.name ?? kid}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <div className="text-[10px] uppercase tracking-[0.22em] text-mist">
                  Integrations
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {sys.connectedTo.map((cid) => (
                    <button
                      key={cid}
                      onClick={() => useStore.getState().openApp(cid)}
                      className="rounded-md border border-sea/25 bg-sea/5 px-2.5 py-1 text-xs text-sea transition hover:bg-sea/15"
                    >
                      {systemById[cid]?.short ?? cid} →
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-6 text-[11px] leading-relaxed text-mist/70">
                Placeholder screenshot. Replace the file{' '}
                <code className="text-mist">public/screens/{sys.id}.png</code>{' '}
                with a real screenshot of the application.
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
