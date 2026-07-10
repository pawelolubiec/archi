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
    title: 'Point-to-point integrations',
    detail:
      'Systems are connected ad hoc; every change in one forces work in the others. Technical debt keeps growing.',
    cost: 'Rising cost of every subsequent change · fragile operations',
  },
  {
    title: 'Compliance and cyber risk',
    detail:
      'NIS2 / KSC imposes obligations with hard deadlines: registry entry in October 2026, full implementation in April 2027.',
    cost: 'Risk of sanctions and board liability · a condition for insurability',
  },
];

export function PainPoints() {
  return (
    <div className="pointer-events-auto w-full max-w-5xl">
      <div className="grid grid-cols-2 gap-3">
        {PAINS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`rounded-xl border border-white/10 bg-navy-900/60 p-5 backdrop-blur-sm ${
              i === PAINS.length - 1 ? 'col-span-2' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#F87171]" />
              <div>
                <h3 className="font-display text-2xl text-paper">{p.title}</h3>
                <p className="mt-2 text-slide-body leading-relaxed text-mist">{p.detail}</p>
                <p className="mt-2 text-base font-medium text-[#F8A9A9]">
                  Cost: {p.cost}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="mt-4 text-center text-slide-body text-paper/80"
      >
        <span className="mr-2 text-gold">▸</span>
        This isn't an IT problem — it's a brake on margin, working capital, and decision speed.
      </motion.p>
    </div>
  );
}
