import { useEffect } from 'react';
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
import { chapters } from '../data/chapters';
import { AppModal } from './AppModal';
import { PainPoints } from './PainPoints';
import { DecisionsPanel } from './DecisionsPanel';
import { FactoryConfigButton } from './FactoryConfigButton';
import { FactoryConfigModal } from './FactoryConfigModal';
import { ArchitectureConfigButton } from './ArchitectureConfigButton';
import { ArchitectureConfigModal } from './ArchitectureConfigModal';
import { OrderFlow } from './OrderFlow';
import { FactoryTourPanel } from './FactoryTourPanel';

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
  const closeFactoryConfig = useStore((s) => s.closeFactoryConfig);
  const closeArchitectureConfig = useStore((s) => s.closeArchitectureConfig);
  const hydrateConfig = useStore((s) => s.hydrateConfig);
  const openModal = useStore((s) => s.openModal);
  const index = useStore((s) => s.index);

  const is3D = chapter.scene === 'globe' || chapter.scene === 'factory';
  const isArchitecture = chapter.scene === 'architecture';
  const isGermanyFactory = chapter.id === 'germany-factory';
  const isSalesSlide = chapter.id === 'germany' || isGermanyFactory;

  useEffect(() => {
    hydrateConfig();
  }, [hydrateConfig]);

  // Close stale panels on slide change; open chapter modal only when landing on that slide.
  useEffect(() => {
    const chapterModal = chapters[index]?.modal;
    if (chapterModal) {
      openModal(chapterModal);
    } else {
      closeModal();
    }
  }, [index, closeModal, openModal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { appModal, closeApp, factoryConfigOpen, architectureConfigOpen } =
        useStore.getState();
      if (e.key === 'Escape') {
        if (factoryConfigOpen) closeFactoryConfig();
        else if (architectureConfigOpen) closeArchitectureConfig();
        else if (appModal) closeApp();
        else closeModal();
        return;
      }
      if (appModal || factoryConfigOpen || architectureConfigOpen) return;
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft') {
        prev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, closeModal, closeFactoryConfig, closeArchitectureConfig]);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-ink">
      {/* 3D layer */}
      <div className="absolute inset-0">
        <Experience />
      </div>

      {/* scrim for 2D panel readability */}
      {!is3D && (
        <div
          className={`pointer-events-none absolute inset-0 ${
            isArchitecture
              ? 'bg-gradient-to-b from-ink/85 via-ink/75 to-ink/90'
              : 'bg-gradient-to-b from-ink/70 via-ink/40 to-ink/80'
          }`}
        />
      )}

      {/* dimmed globe + left-column scrim for sales/integration slides */}
      {is3D && isSalesSlide && (
        <>
          {isGermanyFactory && (
            <div className="pointer-events-none absolute inset-0 bg-ink/35" />
          )}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[min(42rem,55vw)] bg-gradient-to-r from-ink/75 via-ink/45 to-transparent" />
        </>
      )}

      {/* top bar */}
      <header className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-8">
        <div className="pointer-events-auto">
          <Logo />
        </div>
        <div className="pointer-events-auto flex items-center gap-3">
          <FactoryConfigButton />
          <ArchitectureConfigButton />
          <ModeToggle />
        </div>
      </header>

      {/* center content */}
      {is3D ? (
        <>
          <div
            className={`absolute z-10 ${
              chapter.scene === 'factory'
                ? 'left-10 top-28 max-w-lg'
                : 'left-10 top-1/2 -translate-y-1/2'
            }`}
          >
            <Overlay />
          </div>
          {isGermanyFactory ? (
            <div className="absolute inset-y-0 right-8 z-10 flex w-[min(58%,52rem)] items-center justify-center pt-20 pb-28">
              <OrderFlow />
            </div>
          ) : (
            <div className="absolute right-10 top-28 z-10">
              <SystemModal />
            </div>
          )}
          {chapter.scene === 'factory' && (
            <div className="absolute bottom-28 right-10 z-50">
              <FactoryTourPanel />
            </div>
          )}
        </>
      ) : isArchitecture ? (
        <div className="absolute inset-x-4 top-[7.5rem] bottom-[4.75rem] z-10 flex flex-col sm:inset-x-6 lg:inset-x-8">
          <div className="pointer-events-none mb-2.5 flex shrink-0 items-baseline gap-3 slide-chrome">
            <span className="font-display text-3xl leading-none text-gold/80">
              {String(chapter.index + 1).padStart(2, '0')}
            </span>
            <h1 className="font-display text-slide-title leading-none text-paper">
              {chapter.title}
            </h1>
            <span className="text-slide-kicker uppercase tracking-eyebrow text-sea">
              {chapter.eyebrow}
            </span>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <CentralPanel />
          </div>

          <div className="pointer-events-none mt-2.5 flex shrink-0 justify-center px-8">
            <p className="max-w-4xl text-center text-slide-takeaway font-medium leading-snug text-paper/80">
              <span className="mr-2 text-gold">▸</span>
              {chapter.businessMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-x-0 top-[7.5rem] bottom-[4.75rem] z-10 flex flex-col px-6 lg:px-10">
          {/* compact chapter header */}
          <div className="pointer-events-none shrink-0 slide-chrome">
            <div className="flex items-baseline gap-3">
              <span className="font-display text-3xl leading-none text-gold/80">
                {String(chapter.index + 1).padStart(2, '0')}
              </span>
              <h1 className="font-display text-slide-title leading-none text-paper">
                {chapter.title}
              </h1>
              <span className="text-slide-kicker uppercase tracking-eyebrow text-sea">
                {chapter.eyebrow}
              </span>
            </div>
            <p className="mt-1.5 max-w-4xl text-sm text-mist line-clamp-2 lg:text-base">
              {chapter.description}
            </p>
          </div>

          {/* center panel */}
          <div className="flex min-h-0 flex-1 items-center justify-center py-3">
            <CentralPanel />
          </div>

          {/* business message */}
          <div className="pointer-events-none flex shrink-0 justify-center px-8">
            <p className="max-w-4xl text-center text-slide-takeaway font-medium leading-snug text-paper/85">
              <span className="mr-2 text-gold">▸</span>
              {chapter.businessMessage}
            </p>
          </div>
        </div>
      )}

      {/* bottom bar */}
      <footer className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-6 p-8">
        <ChapterProgress />
        <NavigationControls />
      </footer>

      {/* fullscreen app preview */}
      <AppModal />
      <FactoryConfigModal />
      <ArchitectureConfigModal />
    </div>
  );
}
