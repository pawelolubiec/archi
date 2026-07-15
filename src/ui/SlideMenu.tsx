import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { chapters } from '../data/chapters';
import { formatSlideNumber } from '../lib/slideNumber';
import { useStore } from '../store/useStore';
import { Logo } from './Logo';

export function SlideMenu() {
  const [open, setOpen] = useState(false);
  const index = useStore((s) => s.index);
  const goTo = useStore((s) => s.goTo);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        return;
      }

      if (
        event.key === 'ArrowLeft' ||
        event.key === 'ArrowRight' ||
        event.key === ' '
      ) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open]);

  const selectSlide = (slideIndex: number) => {
    goTo(slideIndex);
    setOpen(false);
  };

  return (
    <>
      <Logo onEmblemClick={() => setOpen(true)} menuOpen={open} />

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close slide menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 cursor-default bg-ink/65 backdrop-blur-sm"
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Presentation slides"
              initial={reduceMotion ? false : { x: '-100%' }}
              animate={{ x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[min(24rem,88vw)] flex-col border-r border-white/10 bg-navy-950/95 shadow-[24px_0_80px_rgba(0,12,25,0.55)] backdrop-blur-xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-6 py-5">
                <div>
                  <div className="font-display text-xl text-paper">Presentation</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-[0.24em] text-sea">
                    Digital strategy
                  </div>
                </div>
                <button
                  type="button"
                  autoFocus
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-lg text-mist transition hover:border-white/25 hover:text-paper focus:outline-none focus:ring-2 focus:ring-sea/60"
                  aria-label="Close slide menu"
                >
                  ×
                </button>
              </div>

              <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3" aria-label="Slides">
                {chapters.map((chapter, slideIndex) => {
                  const active = slideIndex === index;
                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      onClick={() => selectSlide(slideIndex)}
                      aria-current={active ? 'page' : undefined}
                      className={`group mb-1 grid w-full grid-cols-[2.5rem_1fr] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
                        active
                          ? 'border-gold/35 bg-gold/10'
                          : 'border-transparent hover:border-white/10 hover:bg-white/5'
                      }`}
                    >
                      <span
                        className={`font-mono text-xs ${
                          active ? 'text-gold' : 'text-mist/55 group-hover:text-mist'
                        }`}
                      >
                        {formatSlideNumber(chapter.index)}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block truncate text-sm font-medium ${
                            active ? 'text-paper' : 'text-mist group-hover:text-paper'
                          }`}
                        >
                          {chapter.title}
                        </span>
                        <span className="mt-0.5 block text-[9px] uppercase tracking-[0.15em] text-sea/65">
                          {chapter.eyebrow}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>

              <div className="shrink-0 border-t border-white/10 px-6 py-3 text-[10px] text-mist/55">
                Select a slide or press Esc to close.
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
