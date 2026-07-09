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
import { AppModal } from './AppModal';
import { PainPoints } from './PainPoints';
import { DecisionsPanel } from './DecisionsPanel';
import { FactoryConfigButton } from './FactoryConfigButton';
import { FactoryConfigModal } from './FactoryConfigModal';
import { ArchitectureConfigButton } from './ArchitectureConfigButton';
import { ArchitectureConfigModal } from './ArchitectureConfigModal';

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

  const is3D = chapter.scene === 'globe' || chapter.scene === 'factory';

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
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink/80" />
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
          <div className="absolute left-10 top-1/2 -translate-y-1/2">
            <Overlay />
          </div>
          <div className="absolute right-10 top-28">
            <SystemModal />
          </div>
        </>
      ) : (
        <>
          {/* compact chapter header */}
          <div className="pointer-events-none absolute left-10 top-24 max-w-md">
            <div className="mb-1 flex items-baseline gap-2">
              <span className="font-display text-3xl text-gold/80">
                {String(chapter.index + 1).padStart(2, '0')}
              </span>
              <span className="text-xs uppercase tracking-eyebrow text-sea">
                {chapter.eyebrow}
              </span>
            </div>
            <h1 className="font-display text-3xl text-paper">{chapter.title}</h1>
            <p className="mt-2 text-sm text-mist">{chapter.description}</p>
          </div>

          {/* center panel */}
          <div className="absolute inset-0 flex items-center justify-center px-10 pt-16">
            <CentralPanel />
          </div>

          {/* business message */}
          <div className="pointer-events-none absolute inset-x-0 bottom-28 flex justify-center px-10">
            <p className="max-w-3xl text-center text-sm font-medium text-paper/80">
              <span className="mr-2 text-gold">▸</span>
              {chapter.businessMessage}
            </p>
          </div>
        </>
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
