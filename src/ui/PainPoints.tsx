import { motion } from 'framer-motion';

interface Pain {
  title: string;
  detail: string;
  cost: string;
}

const PAINS: Pain[] = [
  {
    title: 'Data silos',
    detail:
      'Sales, production, warehouse, and finance report from separate systems. Numbers require manual reconciliation.',
    cost: 'Hours of analyst work every week · conflicting versions of the truth',
  },
  {
    title: 'Manual reporting',
    detail:
      'Key group reports are assembled in spreadsheets and manually maintained pipelines, outside version control.',
    cost: 'Delayed decisions · risk of errors in management data',
  },
  {
    title: 'Decisions without real-time data',
    detail:
      'We see yield, OEE, and losses after the fact. Production corrections arrive one or two shifts too late.',
    cost: 'Lost margin on every production shift',
  },
  {
    title: 'Custom wiring between systems',
    detail:
      'Every new link is built by hand between two apps. Change one system and several others need rework — there is no shared data layer in the middle.',
    cost: 'Every change costs more than the last · operations stay fragile',
  },
  {
    title: 'Inconsistent processes across the group',
    detail:
      'Each site and department runs its own way of working. The same decision — forecast, quality release, margin check — happens differently in Poland, Germany, and the sales offices.',
    cost: 'Slower decisions · duplicated effort · no single way to scale best practice',
  },
  {
    title: 'Margin visible too late',
    detail:
      'Sales quotes without live cost; production yield and OEE seen after the shift. Margin is reconstructed in spreadsheets at month-end — not when we can still change the outcome.',
    cost: 'Lost margin every shift · quotes that look profitable but are not',
  },
];

export function PainPoints() {
  return (
    <div className="pointer-events-auto w-full max-w-6xl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PAINS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-xl border border-white/10 bg-navy-900/60 p-3.5 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#F87171]" />
              <div>
                <h3 className="font-display text-lg text-paper">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mist">{p.detail}</p>
                <p className="mt-1.5 text-xs font-medium text-[#F8A9A9]">
                  Cost: {p.cost}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
