import { create } from 'zustand';
import { chapters, TOTAL_CHAPTERS } from '../data/chapters';
import type { Chapter } from '../data/types';

export type Mode = 'strategic' | 'technical';

interface AppState {
  index: number;
  mode: Mode;
  /** system modal opened manually (click), overrides the chapter modal */
  manualModal: string | null;
  /** fullscreen app preview (screenshot + description) */
  appModal: string | null;
  /** selected scenario in the decision simulation */
  scenarioId: string | null;

  current: () => Chapter;
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
}

export const useStore = create<AppState>((set, get) => ({
  index: 0,
  mode: 'strategic',
  manualModal: null,
  appModal: null,
  scenarioId: null,

  current: () => chapters[get().index],

  next: () =>
    set((s) => ({
      index: Math.min(s.index + 1, TOTAL_CHAPTERS - 1),
      manualModal: null,
      appModal: null,
    })),

  prev: () =>
    set((s) => ({
      index: Math.max(s.index - 1, 0),
      manualModal: null,
      appModal: null,
    })),

  goTo: (index) =>
    set({
      index: Math.max(0, Math.min(index, TOTAL_CHAPTERS - 1)),
      manualModal: null,
      appModal: null,
    }),

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
