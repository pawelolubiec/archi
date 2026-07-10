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
import type { CameraFocus } from '../data/factoryTour';

export type Mode = 'strategic' | 'technical';
export type SceneTransition = 'none' | 'toFactory' | 'toGlobe';
export type ConfigSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const SAVE_DEBOUNCE_MS = 400;
let factorySaveTimer: ReturnType<typeof setTimeout> | null = null;
let factorySavePending: FactoryMapping | null = null;
let architectureSaveTimer: ReturnType<typeof setTimeout> | null = null;
let architectureSavePending: ArchitectureConfig | null = null;

function scheduleFactorySave(
  mapping: FactoryMapping,
  set: (partial: Partial<AppState>) => void,
) {
  factorySavePending = mapping;
  set({ factorySaveStatus: 'saving', factorySaveError: null });

  if (factorySaveTimer) clearTimeout(factorySaveTimer);

  factorySaveTimer = setTimeout(async () => {
    const payload = factorySavePending;
    if (!payload) return;

    try {
      await saveFactoryMappingRemote(payload);
      set({ factorySaveStatus: 'saved', factorySaveError: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save factory mapping';
      console.error('Failed to save factory mapping to D1', err);
      set({ factorySaveStatus: 'error', factorySaveError: message });
    }
  }, SAVE_DEBOUNCE_MS);
}

function scheduleArchitectureSave(
  config: ArchitectureConfig,
  set: (partial: Partial<AppState>) => void,
) {
  architectureSavePending = config;
  set({ architectureSaveStatus: 'saving', architectureSaveError: null });

  if (architectureSaveTimer) clearTimeout(architectureSaveTimer);

  architectureSaveTimer = setTimeout(async () => {
    const payload = architectureSavePending;
    if (!payload) return;

    try {
      await saveArchitectureConfigRemote(payload);
      set({ architectureSaveStatus: 'saved', architectureSaveError: null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to save architecture config';
      console.error('Failed to save architecture config to D1', err);
      set({ architectureSaveStatus: 'error', architectureSaveError: message });
    }
  }, SAVE_DEBOUNCE_MS);
}

function detectTransition(fromIndex: number, toIndex: number): SceneTransition {
  const from = chapters[fromIndex]?.scene;
  const to = chapters[toIndex]?.scene;
  if (from === 'globe' && to === 'factory') return 'toFactory';
  if (from === 'factory' && to === 'globe') return 'toGlobe';
  return 'none';
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
    factoryTourSystem: null,
    factoryFocus: null,
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
  /** system currently spotlighted by the factory tour (slide 05) */
  factoryTourSystem: string | null;
  /** camera override while the factory tour focuses a system */
  factoryFocus: CameraFocus | null;
  /** system → factory zone mapping (one system, many zones) */
  factoryMapping: FactoryMapping;
  factoryConfigOpen: boolean;
  architectureConfig: ArchitectureConfig;
  architectureConfigOpen: boolean;
  configHydrated: boolean;
  factorySaveStatus: ConfigSaveStatus;
  factorySaveError: string | null;
  architectureSaveStatus: ConfigSaveStatus;
  architectureSaveError: string | null;

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
  setFactoryTour: (systemId: string | null, focus: CameraFocus | null) => void;
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
  factoryTourSystem: null,
  factoryFocus: null,
  sceneTransition: 'none',
  transitionProgress: 0,
  transitionFromCamera: null,
  factoryMapping: cloneDefaultMapping(),
  factoryConfigOpen: false,
  architectureConfig: cloneDefaultArchitectureConfig(),
  architectureConfigOpen: false,
  configHydrated: false,
  factorySaveStatus: 'idle',
  factorySaveError: null,
  architectureSaveStatus: 'idle',
  architectureSaveError: null,

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
  setFactoryTour: (systemId, focus) =>
    set({ factoryTourSystem: systemId, factoryFocus: focus }),

  openFactoryConfig: () => set({ factoryConfigOpen: true }),
  closeFactoryConfig: () => set({ factoryConfigOpen: false }),

  setSystemZones: (systemId, zoneIds) =>
    set((s) => {
      const factoryMapping = {
        ...s.factoryMapping,
        [systemId]: [...zoneIds],
      };
      scheduleFactorySave(factoryMapping, set);
      return { factoryMapping };
    }),

  resetFactoryMapping: () => {
    const factoryMapping = cloneDefaultMapping();
    set({ factoryMapping });
    scheduleFactorySave(factoryMapping, set);
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
      scheduleArchitectureSave(architectureConfig, set);
      return { architectureConfig };
    }),

  updateArchitectureElement: (id, patch) =>
    set((s) => {
      const architectureConfig = {
        elements: s.architectureConfig.elements.map((el) =>
          el.id === id ? { ...el, ...patch } : el,
        ),
      };
      scheduleArchitectureSave(architectureConfig, set);
      return { architectureConfig };
    }),

  removeArchitectureElement: (id) =>
    set((s) => {
      const architectureConfig = {
        elements: s.architectureConfig.elements.filter((el) => el.id !== id),
      };
      scheduleArchitectureSave(architectureConfig, set);
      return { architectureConfig };
    }),

  setElementProcessLinks: (id, processIds) =>
    set((s) => {
      const architectureConfig = {
        elements: s.architectureConfig.elements.map((el) =>
          el.id === id ? { ...el, linkedProcessIds: [...processIds] } : el,
        ),
      };
      scheduleArchitectureSave(architectureConfig, set);
      return { architectureConfig };
    }),

  resetArchitectureConfig: () => {
    const architectureConfig = cloneDefaultArchitectureConfig();
    set({ architectureConfig });
    scheduleArchitectureSave(architectureConfig, set);
  },

  hydrateConfig: async () => {
    try {
      const remote = await fetchRemoteConfig();
      const updates: Partial<AppState> = {
        configHydrated: true,
        factorySaveStatus: 'idle',
        factorySaveError: null,
        architectureSaveStatus: 'idle',
        architectureSaveError: null,
      };

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
      const message =
        err instanceof Error ? err.message : 'Failed to load config from D1';
      console.error('Failed to hydrate config from D1', err);
      set({
        configHydrated: true,
        factorySaveStatus: 'error',
        factorySaveError: message,
      });
    }
  },
}));

/** Active modal: manual click only (chapter modals open once on enter via AppShell). */
export function useActiveModal(): string | null {
  return useStore((s) => s.manualModal);
}
