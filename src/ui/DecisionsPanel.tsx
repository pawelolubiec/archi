import { motion } from 'framer-motion';

interface Decision {
  no: string;
  title: string;
  scope: string;
  consequence: string;
}

const DECISIONS: Decision[] = [
  {
    no: 'D1',
    title: 'Approve the digital strategy',
    scope:
      'Endorse the digital strategy — vision, target state and guiding principles for 2026–2030.',
    consequence:
      'Mandates the team to build the detailed execution plan. Without it, the program has no agreed direction.',
  },
  {
    no: 'D2',
    title: 'Approve the execution plan (roadmap)',
    scope:
      'Approve the roadmap that turns strategy into delivery — prioritised initiatives, sequencing, milestones and dependencies.',
    consequence:
      'Releases the first wave of initiatives. Scope protected against “creep” by governance.',
  },
  {
    no: 'D3',
    title: 'Approve budget & governance model',
    scope:
      'Approve the investment envelope (CAPEX/OPEX) and the accountability model — portfolio owners, steering committee, KPIs, board dashboard.',
    consequence:
      'Funds and staffs the program; every initiative is evaluated with the same methodology.',
  },
];

export function DecisionsPanel() {
  return (
    <div className="pointer-events-auto w-full max-w-6xl">
      <div className="grid grid-cols-3 gap-4">
        {DECISIONS.map((d, i) => (
          <motion.div
            key={d.no}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col rounded-2xl border border-gold/25 bg-navy-900/70 p-4 backdrop-blur-sm lg:p-5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/50 bg-gold/10 font-display text-lg text-gold">
              {d.no}
            </div>
            <h3 className="mt-3 font-display text-lg leading-snug text-paper lg:text-xl">
              {d.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-mist">{d.scope}</p>
            <p className="mt-2 text-sm leading-relaxed text-paper/90">
              <span className="text-sea">Consequence:</span> {d.consequence}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
