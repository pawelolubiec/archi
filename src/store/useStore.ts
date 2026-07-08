import { create } from 'zustand';
import type { Vector3Tuple } from 'three';
import { chapters, TOTAL_CHAPTERS } from '../data/chapters';
import type { Chapter } from '../data/types';

export type Mode = 'strategic' | 'technical';
export type SceneTransition = 'none' | 'toFactory' | 'toGlobe';

function detectTransition(fromIndex: number, toIndex: number): SceneTransition {
  const from = chapters[fromIndex]?.scene;
  const to = chapters[toIndex]?.scene;
  if (from === 'globe' && to === 'factory') return 'toFactory';
  if (from === 'factory' && to === 'globe') return 'toGlobe';
  return 'none';
}

interface AppState {
  index: number;
  mode: Mode;
  /** WebGL canvas has been created — the intro gate can reveal the scene */
  sceneReady: boolean;
  /** the presenter has navigated at least once — hides the start hint */
  hasNavigated: boolean;
  /** kiosk mode: auto-advance chapters (toggled with the P key) */
  autoplay: boolean;
  /** system modal opened manually (click), overrides the chapter modal */
  manualModal: string | null;
  /** fullscreen app preview (screenshot + description) */
  appModal: string | null;
  /** selected scenario in the decision simulation */
  scenarioId: string | null;
  /** globe ↔ factory cinematic cross-fade */
  sceneTransition: SceneTransition;
  transitionProgress: number;
  /** camera at the moment a scene transition started */
  transitionFromCamera: {
    position: Vector3Tuple;
    target: Vector3Tuple;
  } | null;

  current: () => Chapter;
  setSceneReady: () => void;
  toggleAutoplay: () => void;
  stopAutoplay: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;
  openModal: (systemId: string) => void;
  closeModal: () => void;
  openApp: (systemId: string) => void;
  closeApp: () => void;
  setScenario: (id: string | null) => void;
  setTransitionProgress: (progress: number) => void;
  finishTransition: () => void;
  setTransitionFromCamera: (cam: {
    position: Vector3Tuple;
    target: Vector3Tuple;
  }) => void;
}

export const useStore = create<AppState>((set, get) => ({
  index: 0,
  mode: 'strategic',
  sceneReady: false,
  hasNavigated: false,
  autoplay: false,
  manualModal: null,
  appModal: null,
  scenarioId: null,
  sceneTransition: 'none',
  transitionProgress: 0,
  transitionFromCamera: null,

  current: () => chapters[get().index],

  setSceneReady: () => set({ sceneReady: true }),

  toggleAutoplay: () => set((s) => ({ autoplay: !s.autoplay })),
  stopAutoplay: () => set({ autoplay: false }),

  next: () =>
    set((s) => {
      const nextIndex = Math.min(s.index + 1, TOTAL_CHAPTERS - 1);
      const transition = detectTransition(s.index, nextIndex);
      return {
        index: nextIndex,
        hasNavigated: true,
        manualModal: null,
        appModal: null,
        sceneTransition: transition,
        transitionProgress: transition === 'none' ? 0 : 0,
        transitionFromCamera:
          transition === 'none' ? null : s.transitionFromCamera,
      };
    }),

  prev: () =>
    set((s) => {
      const nextIndex = Math.max(s.index - 1, 0);
      const transition = detectTransition(s.index, nextIndex);
      return {
        index: nextIndex,
        hasNavigated: true,
        manualModal: null,
        appModal: null,
        sceneTransition: transition,
        transitionProgress: transition === 'none' ? 0 : 0,
        transitionFromCamera:
          transition === 'none' ? null : s.transitionFromCamera,
      };
    }),

  goTo: (index) =>
    set((s) => {
      const nextIndex = Math.max(0, Math.min(index, TOTAL_CHAPTERS - 1));
      const transition = detectTransition(s.index, nextIndex);
      return {
        index: nextIndex,
        hasNavigated: true,
        manualModal: null,
        appModal: null,
        sceneTransition: transition,
        transitionProgress: transition === 'none' ? 0 : 0,
        transitionFromCamera:
          transition === 'none' ? null : s.transitionFromCamera,
      };
    }),

  setTransitionProgress: (progress) => set({ transitionProgress: progress }),
  finishTransition: () =>
    set({
      sceneTransition: 'none',
      transitionProgress: 0,
      transitionFromCamera: null,
    }),
  setTransitionFromCamera: (cam) => set({ transitionFromCamera: cam }),

  setMode: (mode) => set({ mode }),
  toggleMode: () =>
    set((s) => ({
      mode: s.mode === 'strategic' ? 'technical' : 'strategic',
    })),

  openModal: (systemId) => set({ manualModal: systemId }),
  closeModal: () => set({ manualModal: null }),
  openApp: (systemId) => set({ appModal: systemId }),
  closeApp: () => set({ appModal: null }),
  setScenario: (id) => set({ scenarioId: id }),
}));

/** Active modal: manual click > modal defined in the chapter. */
export function useActiveModal(): string | null {
  const manual = useStore((s) => s.manualModal);
  const chapterModal = useStore((s) => chapters[s.index].modal ?? null);
  return manual ?? chapterModal;
}
