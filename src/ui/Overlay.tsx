import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { TOTAL_CHAPTERS } from '../data/chapters';
import { kpiById } from '../data/kpis';

function chapterDescription(chapterId: string, fallback: string): string {
  if (chapterId === 'germany') {
    const forecast = kpiById.forecast_accuracy;
    return `Today a sales office quotes a customer without seeing the real margin, and our demand forecast is right ${forecast.baseline}% of the time — so production plans against guesses. MiFo closes that gap at the very first customer contact.`;
  }
  if (chapterId === 'pts-yield') {
    const yieldKpi = kpiById.yield;
    const oee = kpiById.oee;
    return `Today we learn that yield was ${yieldKpi.baseline}% and OEE ${oee.baseline}% after the fact — too late to react. PTS makes every kilogram of raw fish, every machine and every shift visible live, while the outcome can still be changed.`;
  }
  return fallback;
}

export function Overlay() {
  const index = useStore((s) => s.index);
  const chapter = useStore((s) => s.current());
  const description = chapterDescription(chapter.id, chapter.description);
  const isFactory = chapter.scene === 'factory';
  const isIntegration = chapter.id === 'germany-factory';
  const compactTitle = isFactory || isIntegration;

  return (
    <div
      className={`pointer-events-none slide-chrome ${
        isFactory ? 'max-w-lg' : isIntegration ? 'max-w-md' : 'max-w-2xl'
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
              compactTitle ? 'text-slide-title' : 'text-slide-display'
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
