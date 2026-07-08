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
          className="flex flex-col gap-3 rounded-2xl border border-gold/25 bg-navy-900/70 p-5 backdrop-blur-sm md:flex-row md:gap-5"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gold/50 bg-gold/10 font-display text-lg text-gold">
            {d.no}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-xl leading-snug text-paper">{d.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-mist">{d.scope}</p>
            <p className="mt-2 text-sm text-paper/85">
              <span className="text-sea">Consequence:</span> {d.consequence}
            </p>
          </div>
          <div className="shrink-0 self-start rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gold md:self-center">
            {d.deadline}
          </div>
        </motion.div>
      ))}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-1 text-center text-xs text-mist"
      >
        Financial figures are reference estimates — to be validated with Controlling before formal approval.
      </motion.p>
    </div>
  );
}
