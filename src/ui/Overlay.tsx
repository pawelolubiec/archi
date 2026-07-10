import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { TOTAL_CHAPTERS } from '../data/chapters';
import { kpiById } from '../data/kpis';

function chapterDescription(chapterId: string, fallback: string): string {
  if (chapterId === 'germany') {
    const forecast = kpiById.forecast_accuracy;
    return `Today a sales office quotes a customer without seeing the real margin, and our demand forecast is right ${forecast.baseline}% of the time — so production plans against guesses. MiFo closes that gap at the very first customer contact.`;
  }
  return fallback;
}

export function Overlay() {
  const index = useStore((s) => s.index);
  const chapter = useStore((s) => s.current());
  const description = chapterDescription(chapter.id, chapter.description);
  const isFactory = chapter.scene === 'factory';

  return (
    <div
      className={`pointer-events-none slide-chrome ${
        isFactory ? 'max-w-lg' : 'max-w-2xl'
      }`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="mb-3 flex items-baseline gap-3">
            <span className="font-display text-5xl leading-none text-gold/80 sm:text-6xl">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="text-slide-kicker uppercase tracking-eyebrow text-sea">
              {chapter.eyebrow}
            </span>
            <span className="text-slide-caption text-mist">
              / {String(TOTAL_CHAPTERS).padStart(2, '0')}
            </span>
          </div>

          <h1
            className={`font-display leading-tight text-paper ${
              isFactory ? 'text-slide-title' : 'text-slide-display'
            }`}
          >
            {chapter.title}
          </h1>

          <p
            className={`mt-4 text-slide-body leading-relaxed text-mist ${
              isFactory ? 'line-clamp-2' : ''
            }`}
          >
            {description}
          </p>

          <div
            className={`mt-5 pl-4 ${
              chapter.prominentTakeaway
                ? 'border-l-[3px] border-gold'
                : 'border-l-2 border-gold/60'
            }`}
          >
            <p
              className={
                chapter.prominentTakeaway
                  ? 'text-slide-takeaway font-medium leading-relaxed text-paper'
                  : 'text-slide-takeaway font-medium leading-relaxed text-paper/90'
              }
            >
              {chapter.businessMessage}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
