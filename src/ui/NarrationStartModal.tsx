import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

/**
 * First-slide gate: choose whether the presentation plays with voiceover.
 * Choosing "with narration" calls the registered play handler in the same
 * click gesture so the browser allows autoplay.
 */
export function NarrationStartModal() {
  const open = useStore((s) => s.narrationStartOpen);
  const index = useStore((s) => s.index);
  const chooseNarrationStart = useStore((s) => s.chooseNarrationStart);
  const visible = open && index === 0;

  useEffect(() => {
    if (open && index !== 0) chooseNarrationStart(false);
  }, [open, index, chooseNarrationStart]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="narration-start"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-auto fixed inset-0 z-[60] flex items-center justify-center bg-ink/75 p-6 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="narration-start-title"
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg border border-white/10 bg-navy-900/95 px-8 py-9 shadow-panel backdrop-blur-sm sm:px-10 sm:py-10"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sea">
              Digital strategy
            </p>
            <h2
              id="narration-start-title"
              className="mt-3 font-display text-[clamp(1.75rem,3vw,2.25rem)] leading-tight text-paper"
            >
              How would you like to view this presentation?
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist sm:text-base">
              You can follow with guided narration, or move through the slides
              on your own. You can change this anytime from the control at the
              top right.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => chooseNarrationStart(true)}
                className="flex-1 rounded-full border border-sea/50 bg-sea/15 px-5 py-3 text-sm font-medium text-sea transition hover:bg-sea/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sea/70"
              >
                With narration
              </button>
              <button
                type="button"
                onClick={() => chooseNarrationStart(false)}
                className="flex-1 rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-medium text-paper transition hover:border-white/30 hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Without narration
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
