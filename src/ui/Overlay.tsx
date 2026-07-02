import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { TOTAL_CHAPTERS } from '../data/chapters';

export function Overlay() {
  const index = useStore((s) => s.index);
  const chapter = useStore((s) => s.current());

  return (
    <div className="pointer-events-none max-w-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-3 flex items-baseline gap-3">
            <span className="font-display text-5xl leading-none text-gold/80">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-xs uppercase tracking-eyebrow text-sea">
              {chapter.eyebrow}
            </span>
            <span className="text-xs text-mist">
              / {String(TOTAL_CHAPTERS).padStart(2, '0')}
            </span>
          </div>

          <h1 className="font-display text-4xl leading-tight text-paper">
            {chapter.title}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-mist">
            {chapter.description}
          </p>

          <div className="mt-6 border-l-2 border-gold/60 pl-4">
            <p className="text-sm font-medium leading-relaxed text-paper/90">
              {chapter.businessMessage}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
