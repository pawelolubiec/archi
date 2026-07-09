import { create } from 'zustand';
import type { Vector3Tuple } from 'three';
import { chapters, TOTAL_CHAPTERS } from '../data/chapters';
import {
  cloneDefaultMapping,
  type FactoryMapping,
  type FactoryZoneId,
} from '../data/factoryLayout';
import {
  cloneDefaultArchitectureConfig,
  type ArchitectureConfig,
  type ArchitectureElement,
  type ArchLayerId,
} from '../data/architectureLayout';
import {
  fetchRemoteConfig,
  saveArchitectureConfigRemote,
  saveFactoryMappingRemote,
} from '../lib/configApi';
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

function persistFactoryMapping(mapping: FactoryMapping) {
  saveFactoryMappingRemote(mapping).catch((err) => {
    console.error('Failed to save factory mapping to D1', err);
  });
}

function persistArchitectureConfig(config: ArchitectureConfig) {
  saveArchitectureConfigRemote(config).catch((err) => {
    console.error('Failed to save architecture config to D1', err);
  });
}

function chapterNavState(
  s: { index: number; transitionFromCamera: AppState['transitionFromCamera'] },
  nextIndex: number,
) {
  const transition = detectTransition(s.index, nextIndex);
  return {
    index: nextIndex,
    manualModal: null,
    appModal: null,
    factoryConfigOpen: false,
    architectureConfigOpen: false,
    sceneTransition: transition,
    transitionProgress: transition === 'none' ? 0 : 0,
    transitionFromCamera:
      transition === 'none' ? null : s.transitionFromCamera,
  };
}

interface AppState {
  index: number;
  mode: Mode;
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
  /** system → factory zone mapping (one system, many zones) */
  factoryMapping: FactoryMapping;
  factoryConfigOpen: boolean;
  architectureConfig: ArchitectureConfig;
  architectureConfigOpen: boolean;
  configHydrated: boolean;

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
  setTransitionProgress: (progress: number) => void;
  finishTransition: () => void;
  setTransitionFromCamera: (cam: {
    position: Vector3Tuple;
    target: Vector3Tuple;
  }) => void;
  openFactoryConfig: () => void;
  closeFactoryConfig: () => void;
  setSystemZones: (systemId: string, zoneIds: FactoryZoneId[]) => void;
  resetFactoryMapping: () => void;
  openArchitectureConfig: () => void;
  closeArchitectureConfig: () => void;
  addArchitectureElement: (layer: ArchLayerId, label: string) => void;
  updateArchitectureElement: (
    id: string,
    patch: Partial<Pick<ArchitectureElement, 'label' | 'layer' | 'systemId' | 'linkedProcessIds'>>,
  ) => void;
  removeArchitectureElement: (id: string) => void;
  setElementProcessLinks: (id: string, processIds: string[]) => void;
  resetArchitectureConfig: () => void;
  hydrateConfig: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  index: 0,
  mode: 'strategic',
  manualModal: null,
  appModal: null,
  scenarioId: null,
  sceneTransition: 'none',
  transitionProgress: 0,
  transitionFromCamera: null,
  factoryMapping: cloneDefaultMapping(),
  factoryConfigOpen: false,
  architectureConfig: cloneDefaultArchitectureConfig(),
  architectureConfigOpen: false,
  configHydrated: false,

  current: () => chapters[get().index],

  next: () =>
    set((s) => {
      const nextIndex = Math.min(s.index + 1, TOTAL_CHAPTERS - 1);
      return chapterNavState(s, nextIndex);
    }),

  prev: () =>
    set((s) => {
      const nextIndex = Math.max(s.index - 1, 0);
      return chapterNavState(s, nextIndex);
    }),

  goTo: (index) =>
    set((s) => {
      const nextIndex = Math.max(0, Math.min(index, TOTAL_CHAPTERS - 1));
      return chapterNavState(s, nextIndex);
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

  openFactoryConfig: () => set({ factoryConfigOpen: true }),
  closeFactoryConfig: () => set({ factoryConfigOpen: false }),

  setSystemZones: (systemId, zoneIds) =>
    set((s) => {
      const factoryMapping = {
        ...s.factoryMapping,
        [systemId]: [...zoneIds],
      };
      persistFactoryMapping(factoryMapping);
      return { factoryMapping };
    }),

  resetFactoryMapping: () => {
    const factoryMapping = cloneDefaultMapping();
    persistFactoryMapping(factoryMapping);
    set({ factoryMapping });
  },

  openArchitectureConfig: () => set({ architectureConfigOpen: true }),
  closeArchitectureConfig: () => set({ architectureConfigOpen: false }),

  addArchitectureElement: (layer, label) =>
    set((s) => {
      const element: ArchitectureElement = {
        id: `custom_${Date.now()}`,
        label,
        layer,
        linkedProcessIds: [],
      };
      const architectureConfig = {
        elements: [...s.architectureConfig.elements, element],
      };
      persistArchitectureConfig(architectureConfig);
      return { architectureConfig };
    }),

  updateArchitectureElement: (id, patch) =>
    set((s) => {
      const architectureConfig = {
        elements: s.architectureConfig.elements.map((el) =>
          el.id === id ? { ...el, ...patch } : el,
        ),
      };
      persistArchitectureConfig(architectureConfig);
      return { architectureConfig };
    }),

  removeArchitectureElement: (id) =>
    set((s) => {
      const architectureConfig = {
        elements: s.architectureConfig.elements.filter((el) => el.id !== id),
      };
      persistArchitectureConfig(architectureConfig);
      return { architectureConfig };
    }),

  setElementProcessLinks: (id, processIds) =>
    set((s) => {
      const architectureConfig = {
        elements: s.architectureConfig.elements.map((el) =>
          el.id === id ? { ...el, linkedProcessIds: [...processIds] } : el,
        ),
      };
      persistArchitectureConfig(architectureConfig);
      return { architectureConfig };
    }),

  resetArchitectureConfig: () => {
    const architectureConfig = cloneDefaultArchitectureConfig();
    persistArchitectureConfig(architectureConfig);
    set({ architectureConfig });
  },

  hydrateConfig: async () => {
    try {
      const remote = await fetchRemoteConfig();
      const updates: Partial<AppState> = { configHydrated: true };

      if (remote.factoryMapping && typeof remote.factoryMapping === 'object') {
        updates.factoryMapping = remote.factoryMapping;
      }
      if (
        remote.architectureConfig?.elements &&
        Array.isArray(remote.architectureConfig.elements)
      ) {
        updates.architectureConfig = remote.architectureConfig;
      }

      set(updates);
    } catch (err) {
      console.error('Failed to hydrate config from D1', err);
      set({ configHydrated: true });
    }
  },
}));

/** Active modal: manual click > modal defined in the chapter. */
export function useActiveModal(): string | null {
  const manual = useStore((s) => s.manualModal);
  const chapterModal = useStore((s) => chapters[s.index].modal ?? null);
  return manual ?? chapterModal;
}
