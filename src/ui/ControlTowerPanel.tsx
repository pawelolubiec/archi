import { motion, useReducedMotion } from 'framer-motion';

const CAPABILITIES = [
  'alerts',
  'Gen-AI recommendations',
  'margin simulation',
  'human approval',
  'audit log',
] as const;

const STAGES = [
  {
    id: 'signals',
    label: 'Every signal lands',
    detail:
      'Demand variance, capacity squeeze, ordering deadlines, quality and farm flags — alerts from every system meet in one place, each with a deep link to where the answer lives.',
  },
  {
    id: 'propose',
    label: 'AI proposes — people decide',
    detail:
      'The agent turns signals into quantified proposals with profit impact. It can warn about side effects. One thing it cannot do: publish anything on its own.',
  },
  {
    id: 'cascade',
    label: 'One approval — every plan updates',
    detail:
      'A human clicks Approve. Forecast, budget, production, purchasing and staffing stay consistent automatically — no e-mails, no re-typing, full audit trail.',
  },
] as const;

const SYSTEMS = ['MiFo', 'PTS', 'PID', 'ERP', 'WMS', 'QMS'] as const;

function TowerIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 40 40"
      className="h-9 w-9 shrink-0"
      fill="none"
    >
      <rect
        x="1"
        y="1"
        width="38"
        height="38"
        rx="6"
        fill="rgba(242,247,252,0.06)"
        stroke="rgba(214,191,145,0.55)"
        strokeWidth="1"
      />
      <path
        d="M20 8v4M16 12h8l-1.2 16H17.2L16 12Z"
        stroke="#F2F7FC"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="10" r="1.6" fill="#D6BF91" />
      <circle cx="11" cy="22" r="2.2" stroke="#2EC5C5" strokeWidth="1.2" />
      <circle cx="29" cy="18" r="2.2" stroke="#2EC5C5" strokeWidth="1.2" />
      <circle cx="27" cy="29" r="2.2" stroke="#D6BF91" strokeWidth="1.2" />
      <path
        d="M13 21.2 17.2 16.5M27.2 19.2 22.5 14.8M25.4 27.4 22 24"
        stroke="rgba(157,180,204,0.75)"
        strokeWidth="1.1"
      />
    </svg>
  );
}

function FlowArrow({
  direction,
  delay,
  reduceMotion,
}: {
  direction: 'up' | 'down';
  delay: number;
  reduceMotion: boolean | null;
}) {
  const isUp = direction === 'up';
  return (
    <motion.div
      className="flex flex-col items-center gap-0.5"
      initial={reduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.35 }}
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-0 w-0 border-x-[5px] border-x-transparent"
          style={{
            borderBottomWidth: isUp ? 7 : 0,
            borderTopWidth: isUp ? 0 : 7,
            borderBottomColor: isUp ? '#2EC5C5' : undefined,
            borderTopColor: isUp ? undefined : '#D6BF91',
            opacity: 0.35 + i * 0.25,
          }}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: isUp ? [4, -2, 4] : [-4, 2, -4],
                  opacity: [0.35, 0.95, 0.35],
                }
          }
          transition={
            reduceMotion
              ? undefined
              : {
                  duration: 1.6,
                  delay: delay + i * 0.12,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }
          }
        />
      ))}
    </motion.div>
  );
}

export function ControlTowerPanel() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-auto flex h-full w-full max-w-[72rem] flex-col justify-center gap-[clamp(0.75rem,1.6vh,1.35rem)]">
      {/* Control Tower bar */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border border-gold/40 bg-gradient-to-b from-navy-800/95 to-navy-900/95 px-[clamp(1rem,1.6vw,1.5rem)] py-[clamp(0.85rem,1.5vh,1.2rem)] shadow-[0_0_0_1px_rgba(214,191,145,0.12),0_24px_60px_-28px_rgba(0,0,0,0.85)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #9DB4CC 1px, transparent 0)',
            backgroundSize: '14px 14px',
          }}
        />
        <div className="relative flex items-start gap-4">
          <TowerIcon />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-[clamp(1.15rem,1.8vw,1.65rem)] leading-tight text-paper [text-wrap:balance]">
              Control Tower — Decision, Automation &amp; AI Orchestration
            </h2>
            <p className="mt-1.5 text-[clamp(0.7rem,0.85vw,0.9rem)] leading-relaxed text-mist">
              {CAPABILITIES.join(' · ')}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Signals up / Decisions down */}
      <div className="flex items-center justify-between gap-4 px-2">
        <FlowArrow direction="up" delay={0.15} reduceMotion={reduceMotion} />
        <motion.p
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="font-mono text-[clamp(0.65rem,0.75vw,0.8rem)] uppercase tracking-[0.22em] text-gold"
        >
          Signals up <span className="mx-1.5 text-paper/40">◦</span> Decisions
          down
        </motion.p>
        <FlowArrow direction="down" delay={0.2} reduceMotion={reduceMotion} />
      </div>

      {/* Three-stage loop — from the living-forecast Control Tower story */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {STAGES.map((stage, i) => (
          <motion.div
            key={stage.id}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.2 + i * 0.08,
              duration: 0.4,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="rounded-xl border border-white/10 bg-navy-900/75 p-[clamp(0.85rem,1.2vw,1.15rem)] backdrop-blur-sm"
          >
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[clamp(0.65rem,0.7vw,0.75rem)] text-gold/80">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="text-[clamp(0.95rem,1.1vw,1.15rem)] font-semibold text-paper">
                {stage.label}
              </h3>
            </div>
            <p className="mt-2 text-[clamp(0.75rem,0.85vw,0.9rem)] leading-relaxed text-mist">
              {stage.detail}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Data foundation */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="rounded-xl border border-sea/25 bg-sea/[0.06] px-[clamp(0.85rem,1.2vw,1.15rem)] py-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-mono text-[clamp(0.6rem,0.65vw,0.7rem)] uppercase tracking-[0.18em] text-sea">
              One shared data layer
            </div>
            <p className="mt-0.5 text-[clamp(0.75rem,0.85vw,0.9rem)] text-mist">
              Forecast, standard costs, capacity and KPIs — the same engine that
              drafts the budget also scores margin before you commit
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {['Lakehouse', 'Master data', 'Margin simulator'].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-sea/30 bg-sea/10 px-2.5 py-0.5 text-[clamp(0.65rem,0.7vw,0.75rem)] text-sea"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Source systems */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="rounded-xl border border-white/10 bg-navy-900/60 px-[clamp(0.85rem,1.2vw,1.15rem)] py-3"
      >
        <div className="mb-2 font-mono text-[clamp(0.6rem,0.65vw,0.7rem)] uppercase tracking-[0.18em] text-mist/70">
          Applications below — one approval keeps every plan consistent
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {SYSTEMS.map((sys, i) => (
            <motion.div
              key={sys}
              initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.04, duration: 0.3 }}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2 text-center text-[clamp(0.75rem,0.85vw,0.9rem)] font-medium text-paper/90"
            >
              {sys}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
