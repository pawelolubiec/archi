import { motion } from 'framer-motion';

interface Decision {
  no: string;
  title: string;
  scope: string;
  consequence: string;
  deadline: string;
}

const DECISIONS: Decision[] = [
  {
    no: 'D1',
    title: 'Direction: hybrid architecture + 2026–2030 investment envelope',
    scope:
      'Approval of the target architecture (ERP as financial core, specialized systems, Data Platform, AI) and the program’s investment envelope — CAPEX ~€4.2M / OPEX ~€0.65M per year (estimate to be validated with Controlling).',
    consequence:
      'Launches the foundations phase: Data Platform, integrations, preparation of system selection.',
    deadline: 'Decision: this meeting',
  },
  {
    no: 'D2',
    title: 'Approval to start the ERP selection process (financial core)',
    scope:
      'Authorization of an RFP for the financial core (candidates: Workday / IFS), with scope limited to finance — without moving operations into the ERP.',
    consequence:
      'RFP in Q3 2026, selection decision in Q1 2027, implementation in 2027. Scope protected against "creep" by governance.',
    deadline: 'RFP start: Q3 2026',
  },
  {
    no: 'D3',
    title: 'Governance model + NIS2 / KSC compliance program',
    scope:
      'Adoption of a single accountability model for initiatives (portfolio, stage-gate, KPI owners, board dashboard) and approval of the NIS2/KSC program charter.',
    consequence:
      'Every investment evaluated with the same methodology. Meeting deadlines: registry entry October 2026, full implementation April 2027.',
    deadline: 'KSC registry: October 2026',
  },
];

export function DecisionsPanel() {
  return (
    <div className="pointer-events-auto w-full max-w-4xl space-y-3">
      {DECISIONS.map((d, i) => (
        <motion.div
          key={d.no}
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex gap-5 rounded-2xl border border-gold/25 bg-navy-900/70 p-5 backdrop-blur-sm"
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-gold/50 bg-gold/10 font-display text-xl text-gold">
            {d.no}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-slide-title leading-snug text-paper">{d.title}</h3>
            <p className="mt-2 text-slide-body leading-relaxed text-mist">{d.scope}</p>
            <p className="mt-2 text-slide-body text-paper/90">
              <span className="text-sea">Consequence:</span> {d.consequence}
            </p>
          </div>
          <div className="shrink-0 self-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-slide-caption text-gold">
            {d.deadline}
          </div>
        </motion.div>
      ))}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-1 text-center text-slide-caption text-mist"
      >
        Financial figures are reference estimates — to be validated with Controlling before formal approval.
      </motion.p>
    </div>
  );
}
