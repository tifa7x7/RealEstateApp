import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { PROJECTS } from '@/data/projects';
import { defaultCalcObject } from '@/lib/calculator';
import type { PriceAlert } from '@/lib/api/alerts';
import type {
  CalcObject,
  Locale,
  RentalProperty,
  SavedCalc,
  UserTier,
} from '@/lib/types';

interface UserPrefsState {
  locale: Locale;
  currentTier: UserTier;
  favorites: number[];
  favUnits: string[];
  notes: Record<string, string>;
  loggedIn: boolean;
  userName: string;
  userEmail: string;
  savedCalcs: SavedCalc[];
  rentalProperties: RentalProperty[];
  /**
   * Phase 11 — first-run calculator UX. False until the user explicitly
   * dismisses the wizard or completes step 3. Drives whether `/calculator`
   * renders `CalcWizardSteps` (false) or the full `CalcWizard` form (true).
   */
  calcWizardSeen: boolean;
  /**
   * Phase 16 — onboarding nudge for price alerts. Set to true once the user
   * either accepts or dismisses the inline strip on the favorites surface
   * so it stops re-appearing. Persisted so the choice survives reloads.
   */
  alertsNudgeDismissed: boolean;
}

interface UserPrefsActions {
  setLocale: (locale: Locale) => void;
  setTier: (tier: UserTier) => void;
  toggleFavorite: (id: number) => void;
  toggleFavUnit: (projectId: number, unitId: string) => void;
  setNote: (id: string, text: string) => void;
  login: (name: string, email: string) => void;
  logout: () => void;
  saveCalc: (entry: SavedCalc) => void;
  deleteSavedCalc: (id: number | string) => void;
  loadSavedCalc: (id: number | string) => void;
  addRentalProperty: (prop: RentalProperty) => void;
  updateRentalProperty: (
    id: number | string,
    patch: Partial<RentalProperty>,
  ) => void;
  removeRentalProperty: (id: number | string) => void;
  setCalcWizardSeen: (seen: boolean) => void;
  setAlertsNudgeDismissed: (dismissed: boolean) => void;
}

interface UIState {
  showMarketRef: boolean;
  compareIds: number[];
  /**
   * Phase 16 — in-memory cache of the authenticated user's price alerts.
   * Hydrated by `useSupabaseUserDataSync`; not persisted (server is the
   * source of truth, no offline write-through for alerts).
   */
  priceAlerts: PriceAlert[];
}

interface UIActions {
  setShowMarketRef: (value: boolean) => void;
  toggleCompare: (id: number) => void;
  clearCompare: () => void;
  setPriceAlerts: (alerts: PriceAlert[]) => void;
  upsertPriceAlert: (alert: PriceAlert) => void;
  removePriceAlert: (id: string) => void;
}

interface CalculatorState {
  calcObjects: CalcObject[];
  activeCalcIndex: number;
}

interface CalculatorActions {
  setCalcField: <K extends keyof CalcObject>(field: K, value: CalcObject[K]) => void;
  resetCalc: () => void;
  prefillCalcFromUnit: (projectId: number, unitId: string) => void;
  addCalcObject: () => void;
  removeCalcObject: (index: number) => void;
  setActiveCalcIndex: (index: number) => void;
}

const MAX_COMPARE = 5;
const MAX_CALC_OBJECTS = 5;
const STORE_VERSION = 1;

const RENT_BY_TYPE: Record<string, number> = {
  Студия: 25000,
  '1К': 33200,
  '2К': 40600,
  '3К': 52600,
  '4К': 60000,
  '5К': 70000,
};

function stageFromStatus(status: string): string {
  switch (status) {
    case 'Строится':
      return 'Строительство';
    case 'Проектируется':
      return 'Котлован';
    case 'Сдан':
      return 'Готов';
    default:
      return 'Сдача';
  }
}

function roomsToLabel(rooms: number): string {
  if (rooms === 0) return 'Студия';
  return `${rooms}К`;
}

export type AppStore = UserPrefsState &
  UserPrefsActions &
  UIState &
  UIActions &
  CalculatorState &
  CalculatorActions;

function migrateFromV0(persistedState: unknown): unknown {
  if (persistedState === null || typeof persistedState !== 'object') {
    return persistedState;
  }
  const state = { ...(persistedState as Record<string, unknown>) };
  if ('calcObject' in state && !('calcObjects' in state)) {
    const old = state.calcObject;
    state.calcObjects = old ? [old] : [defaultCalcObject()];
    state.activeCalcIndex = 0;
    delete state.calcObject;
  }
  return state;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // userPrefs (persisted)
      locale: 'ru',
      currentTier: 'free',
      favorites: [],
      favUnits: [],
      notes: {},
      loggedIn: false,
      userName: '',
      userEmail: '',
      savedCalcs: [],
      rentalProperties: [],
      calcWizardSeen: false,
      alertsNudgeDismissed: false,

      setLocale: (locale) => set({ locale }),
      setTier: (currentTier) => set({ currentTier }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      toggleFavUnit: (projectId, unitId) => {
        const key = `${projectId}__${unitId}`;
        set((s) => ({
          favUnits: s.favUnits.includes(key)
            ? s.favUnits.filter((f) => f !== key)
            : [...s.favUnits, key],
        }));
      },
      setNote: (id, text) => set((s) => ({ notes: { ...s.notes, [id]: text } })),
      login: (userName, userEmail) =>
        set({ loggedIn: true, userName, userEmail }),
      logout: () => set({ loggedIn: false }),
      saveCalc: (entry) => set((s) => ({ savedCalcs: [...s.savedCalcs, entry] })),
      deleteSavedCalc: (id) =>
        set((s) => ({ savedCalcs: s.savedCalcs.filter((c) => c.id !== id) })),
      loadSavedCalc: (id) => {
        const saved = get().savedCalcs.find((c) => c.id === id);
        if (!saved || saved.objects.length === 0) return;
        set({ calcObjects: [...saved.objects], activeCalcIndex: 0 });
      },
      addRentalProperty: (prop) =>
        set((s) => ({ rentalProperties: [...s.rentalProperties, prop] })),
      updateRentalProperty: (id, patch) =>
        set((s) => ({
          rentalProperties: s.rentalProperties.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        })),
      removeRentalProperty: (id) =>
        set((s) => ({
          rentalProperties: s.rentalProperties.filter((p) => p.id !== id),
        })),
      setCalcWizardSeen: (calcWizardSeen) => set({ calcWizardSeen }),
      setAlertsNudgeDismissed: (alertsNudgeDismissed) =>
        set({ alertsNudgeDismissed }),

      // ui (not persisted)
      showMarketRef: false,
      compareIds: [],
      priceAlerts: [],
      setShowMarketRef: (showMarketRef) => set({ showMarketRef }),
      toggleCompare: (id) =>
        set((s) => {
          if (s.compareIds.includes(id)) {
            return { compareIds: s.compareIds.filter((x) => x !== id) };
          }
          if (s.compareIds.length >= MAX_COMPARE) return s;
          return { compareIds: [...s.compareIds, id] };
        }),
      clearCompare: () => set({ compareIds: [] }),
      setPriceAlerts: (priceAlerts) => set({ priceAlerts }),
      upsertPriceAlert: (alert) =>
        set((s) => {
          const idx = s.priceAlerts.findIndex((a) => a.id === alert.id);
          if (idx >= 0) {
            const next = [...s.priceAlerts];
            next[idx] = alert;
            return { priceAlerts: next };
          }
          return { priceAlerts: [alert, ...s.priceAlerts] };
        }),
      removePriceAlert: (id) =>
        set((s) => ({ priceAlerts: s.priceAlerts.filter((a) => a.id !== id) })),

      // calculator (persisted)
      calcObjects: [defaultCalcObject()],
      activeCalcIndex: 0,
      setCalcField: (field, value) =>
        set((s) => {
          const next = [...s.calcObjects];
          const idx = s.activeCalcIndex;
          const current = next[idx];
          if (!current) return s;
          next[idx] = { ...current, [field]: value };
          return { calcObjects: next };
        }),
      resetCalc: () =>
        set({ calcObjects: [defaultCalcObject()], activeCalcIndex: 0 }),
      prefillCalcFromUnit: (projectId, unitId) => {
        const project = PROJECTS.find((p) => p.id === projectId);
        const unit = project?.units.find((u) => u.id === unitId);
        if (!project || !unit) return;
        const roomLabel = roomsToLabel(unit.rooms);
        set((s) => {
          const next = [...s.calcObjects];
          const idx = s.activeCalcIndex;
          const current = next[idx];
          if (!current) return s;
          next[idx] = {
            ...current,
            name: `${project.name} — ${unit.id}`,
            district: project.district,
            aptType: roomLabel,
            area: unit.area,
            floorInfo: `${unit.floor} / ${project.floors}`,
            completionDate: project.completion,
            stage: stageFromStatus(project.status),
            price: unit.price,
            monthlyRent: RENT_BY_TYPE[roomLabel] ?? 33200,
            sourceProjectId: project.id,
            sourceUnitId: unit.id,
          };
          return { calcObjects: next };
        });
      },
      addCalcObject: () =>
        set((s) => {
          if (s.calcObjects.length >= MAX_CALC_OBJECTS) return s;
          const next = [...s.calcObjects, defaultCalcObject()];
          return { calcObjects: next, activeCalcIndex: next.length - 1 };
        }),
      removeCalcObject: (index) =>
        set((s) => {
          if (s.calcObjects.length <= 1) return s;
          if (index < 0 || index >= s.calcObjects.length) return s;
          const next = s.calcObjects.filter((_, i) => i !== index);
          const nextActive =
            s.activeCalcIndex >= next.length
              ? next.length - 1
              : s.activeCalcIndex >= index && s.activeCalcIndex > 0
                ? s.activeCalcIndex - 1
                : s.activeCalcIndex;
          return { calcObjects: next, activeCalcIndex: nextActive };
        }),
      setActiveCalcIndex: (index) =>
        set((s) => {
          if (index < 0 || index >= s.calcObjects.length) return s;
          return { activeCalcIndex: index };
        }),
    }),
    {
      name: 'real-estate-app',
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState, version) => {
        if (version < 1) return migrateFromV0(persistedState);
        return persistedState;
      },
      partialize: (state) => ({
        locale: state.locale,
        currentTier: state.currentTier,
        favorites: state.favorites,
        favUnits: state.favUnits,
        notes: state.notes,
        loggedIn: state.loggedIn,
        userName: state.userName,
        userEmail: state.userEmail,
        savedCalcs: state.savedCalcs,
        rentalProperties: state.rentalProperties,
        calcObjects: state.calcObjects,
        activeCalcIndex: state.activeCalcIndex,
        calcWizardSeen: state.calcWizardSeen,
        alertsNudgeDismissed: state.alertsNudgeDismissed,
      }),
    },
  ),
);

export { MAX_CALC_OBJECTS };
