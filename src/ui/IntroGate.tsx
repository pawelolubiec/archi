import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { BRAND } from '../data/brand';
import { useStore } from '../store/useStore';

/**
 * Branded opening moment: an ink-black cover with the Milarex mark that lifts
 * once the WebGL scene is live, so the globe never pops in half-rendered.
 */
export function IntroGate() {
  const sceneReady = useStore((s) => s.sceneReady);
  const reducedMotion = useReducedMotion();
  const [dwellDone, setDwellDone] = useState(false);

  useEffect(() => {
    // Minimum on-screen time so the intro reads as intentional, not a flash.
    const t = window.setTimeout(() => setDwellDone(true), reducedMotion ? 0 : 1400);
    return () => window.clearTimeout(t);
  }, [reducedMotion]);

  const visible = !(sceneReady && dwellDone);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="absolute inset-0 z-50 flex items-center justify-center bg-ink"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="flex flex-col items-center text-center"
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <svg width="72" height="72" viewBox="0 0 34 34" fill="none">
              <circle cx="17" cy="17" r="16" stroke={BRAND.gold} strokeWidth="0.8" opacity="0.6" />
              <path
                d="M3 20 C 8 14, 12 26, 17 20 S 26 14, 31 20"
                stroke={BRAND.sea}
                strokeWidth="1.4"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M3 24 C 8 18, 12 30, 17 24 S 26 18, 31 24"
                stroke={BRAND.gold}
                strokeWidth="1"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>
            <div className="mt-6 font-display text-3xl tracking-wide text-paper">
              MILAREX
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-eyebrow text-mist">
              Digital Architecture
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
