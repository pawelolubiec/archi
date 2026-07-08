import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { TOTAL_CHAPTERS } from '../data/chapters';

const DEFAULT_DWELL_S = 20;

/**
 * Kiosk mode (P key): auto-advances chapters using each chapter's
 * autoAdvanceSeconds (default 20 s). Any click or manual navigation stops it;
 * it also stops on the last chapter. Renders a subtle indicator while active.
 */
export function AutoplayController() {
  const autoplay = useStore((s) => s.autoplay);
  const index = useStore((s) => s.index);

  useEffect(() => {
    if (!autoplay) return;
    const { current, next, stopAutoplay } = useStore.getState();

    if (index >= TOTAL_CHAPTERS - 1) {
      stopAutoplay();
      return;
    }

    const dwell = (current().autoAdvanceSeconds ?? DEFAULT_DWELL_S) * 1000;
    const timer = window.setTimeout(next, dwell);

    // any pointer interaction hands control back to the presenter
    const onPointer = () => useStore.getState().stopAutoplay();
    window.addEventListener('pointerdown', onPointer);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointerdown', onPointer);
    };
  }, [autoplay, index]);

  return (
    <AnimatePresence>
      {autoplay && (
        <motion.div
          className="pointer-events-none flex items-center gap-2 text-xs text-mist"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-green"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          auto · P to stop
        </motion.div>
      )}
    </AnimatePresence>
  );
}
