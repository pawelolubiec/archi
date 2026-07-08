import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { TOTAL_CHAPTERS } from '../data/chapters';

export function Overlay() {
  const index = useStore((s) => s.index);
  const chapter = useStore((s) => s.current());

  return (
    <div className="pointer-events-none max-w-md 2xl:max-w-xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-3 flex items-baseline gap-3">
            <span className="font-display text-3xl leading-none text-gold/80 md:text-4xl 2xl:text-5xl">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-xs uppercase tracking-eyebrow text-sea">
              {chapter.eyebrow}
            </span>
            <span className="text-xs text-mist">
              / {String(TOTAL_CHAPTERS).padStart(2, '0')}
            </span>
          </div>

          <h1 className="font-display text-2xl leading-tight text-paper md:text-3xl 2xl:text-4xl">
            {chapter.title}
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-mist md:mt-4 2xl:text-base">
            {chapter.description}
          </p>

          <div className="mt-3 border-l-2 border-gold/60 pl-4 md:mt-6">
            <p className="text-sm font-medium leading-relaxed text-paper/90">
              {chapter.businessMessage}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
