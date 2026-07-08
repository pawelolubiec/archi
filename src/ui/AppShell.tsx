import { useEffect, useRef } from 'react';
import { Experience } from '../three/Experience';
import { Logo } from './Logo';
import { Overlay } from './Overlay';
import { SystemModal } from './SystemModal';
import { NavigationControls } from './NavigationControls';
import { ChapterProgress } from './ChapterProgress';
import { ModeToggle } from './ModeToggle';
import { ArchitectureLayers } from './ArchitectureLayers';
import { KPIBoard } from './KPIBoard';
import { GovernanceCard } from './GovernanceCard';
import { ScenarioPanel } from './ScenarioPanel';
import { RoadmapTimeline } from './RoadmapTimeline';
import { useStore } from '../store/useStore';
import { AppModal } from './AppModal';
import { PainPoints } from './PainPoints';
import { DecisionsPanel } from './DecisionsPanel';
import { IntroGate } from './IntroGate';
import { StartHint } from './StartHint';
import { FullscreenButton, toggleFullscreen } from './FullscreenButton';
import { AutoplayController } from './AutoplayController';

function CentralPanel() {
  const chapter = useStore((s) => s.current());
  switch (chapter.scene) {
    case 'pain':
      return <PainPoints />;
    case 'architecture':
      return <ArchitectureLayers />;
    case 'kpi':
      return <KPIBoard />;
    case 'roadmap':
      return <RoadmapTimeline />;
    case 'decisions':
      return <DecisionsPanel />;
    case 'scenario':
      return chapter.id === 'governance' ? <GovernanceCard /> : <ScenarioPanel />;
    default:
      return null;
  }
}

export function AppShell() {
  const chapter = useStore((s) => s.current());
  const next = useStore((s) => s.next);
  const prev = useStore((s) => s.prev);
  const closeModal = useStore((s) => s.closeModal);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const is3D = chapter.scene === 'globe' || chapter.scene === 'factory';

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    const { appModal, stopAutoplay } = useStore.getState();
    if (appModal) return; // fullscreen preview open — don't change chapters
    // clearly horizontal swipes only, so vertical panel scrolling stays free
    if (Math.abs(dx) > 60 && Math.abs(dx) > 2 * Math.abs(dy)) {
      stopAutoplay();
      if (dx < 0) next();
      else prev();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { appModal, closeApp, toggleAutoplay, stopAutoplay } =
        useStore.getState();
      if (e.key === 'Escape') {
        if (appModal) closeApp();
        else closeModal();
        return;
      }
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
        return;
      }
      if (appModal) return; // fullscreen open — don't change chapters
      if (e.key === 'p' || e.key === 'P') {
        toggleAutoplay();
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        stopAutoplay();
        next();
      } else if (e.key === 'ArrowLeft') {
        stopAutoplay();
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, closeModal]);

  return (
    <div
      className="relative h-dvh w-screen overflow-hidden bg-ink"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* 3D layer */}
      <div className="absolute inset-0">
        <Experience />
      </div>

      {/* scrim for 2D panel readability */}
      {!is3D && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink/80" />
      )}

      {/* top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4 md:p-6 2xl:p-8">
        <div className="pointer-events-auto">
          <Logo />
        </div>
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="hidden md:block">
            <FullscreenButton />
          </div>
          <ModeToggle />
        </div>
      </header>

      {/* center content */}
      {is3D ? (
        <>
          <div className="absolute left-4 right-4 top-[4.5rem] md:left-8 md:right-auto md:top-1/2 md:-translate-y-1/2 2xl:left-10">
            <Overlay />
          </div>
          <div className="absolute inset-x-3 bottom-[5.75rem] md:inset-x-auto md:bottom-auto md:right-8 md:top-24 2xl:right-10 2xl:top-28">
            <SystemModal />
          </div>
        </>
      ) : (
        <>
          {/* compact chapter header */}
          <div className="pointer-events-none absolute left-4 right-4 top-[4.5rem] md:left-8 md:right-auto md:top-20 md:max-w-sm 2xl:left-10 2xl:top-24 2xl:max-w-md">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-display text-2xl text-gold/80 2xl:text-3xl">
                {String(chapter.index + 1).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-eyebrow text-sea">
                {chapter.eyebrow}
              </span>
            </div>
            <h1 className="font-display text-2xl text-paper 2xl:text-3xl">{chapter.title}</h1>
            <p className="mt-2 text-sm text-mist">{chapter.description}</p>
          </div>

          {/* center panel — scrolls on small screens */}
          <div className="thin-scroll absolute inset-0 flex items-start justify-center overflow-y-auto px-4 pb-28 pt-48 md:items-center md:overflow-visible md:px-10 md:pb-0 md:pt-16">
            <CentralPanel />
          </div>

          {/* business message */}
          <div className="pointer-events-none absolute inset-x-0 bottom-28 hidden justify-center px-10 md:flex">
            <p className="max-w-3xl text-center text-sm font-medium text-paper/80">
              <span className="mr-2 text-gold">▸</span>
              {chapter.businessMessage}
            </p>
          </div>
        </>
      )}

      {/* start hint on the opening chapter */}
      {chapter.index === 0 && <StartHint />}

      {/* bottom bar */}
      <footer className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-center gap-3 border-t border-white/5 bg-ink/75 p-4 backdrop-blur-md md:border-t-0 md:bg-transparent md:backdrop-blur-none md:flex-nowrap md:justify-between md:gap-6 md:p-6 2xl:p-8">
        <ChapterProgress />
        <div className="flex items-center gap-5">
          <AutoplayController />
          <NavigationControls />
        </div>
      </footer>

      {/* fullscreen app preview */}
      <AppModal />

      {/* branded opening cover */}
      <IntroGate />
    </div>
  );
}
