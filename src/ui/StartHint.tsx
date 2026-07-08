import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

/** Gentle "how to start" cue on the opening chapter, gone after first navigation. */
export function StartHint() {
  const hasNavigated = useStore((s) => s.hasNavigated);
  const sceneReady = useStore((s) => s.sceneReady);

  return (
    <AnimatePresence>
      {sceneReady && !hasNavigated && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-24 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          transition={{ delay: 2.2, duration: 0.8 }}
        >
          <motion.span
            className="text-xs uppercase tracking-eyebrow text-mist"
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            Press <span className="text-gold">→</span> to begin
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
