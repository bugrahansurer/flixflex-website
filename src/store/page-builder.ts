// ═══════════════════════════════════════════════════════════
// FlixFlex — Page Builder Zustand Store
// ═══════════════════════════════════════════════════════════

import { create } from "zustand"
import type { PageData, SectionBlock, SectionType, SectionTransition } from "@/types/page-builder"
import { SECTION_REGISTRY } from "@/lib/page-builder/section-registry"

// ── History helpers ───────────────────────────────
const MAX_HISTORY = 50

interface HistoryState {
  past:    SectionBlock[][]
  future:  SectionBlock[][]
}

function pushHistory(
  hist: HistoryState,
  current: SectionBlock[]
): HistoryState {
  const past = [...hist.past, current]
  return {
    past: past.length > MAX_HISTORY ? past.slice(past.length - MAX_HISTORY) : past,
    future: [],
  }
}

// ── Store State ───────────────────────────────────
export interface PageBuilderState {
  page:              PageData | null
  selectedSectionId: string | null
  isDirty:           boolean
  lastSavedAt:       string | null
  _history:          HistoryState
  canUndo:           boolean
  canRedo:           boolean
}

// ── Store Actions ─────────────────────────────────
export interface PageBuilderActions {
  setPage:                (page: PageData) => void
  setTitle:               (title: string) => void
  setStatus:              (status: PageData["status"]) => void
  addSection:             (type: SectionType) => void
  removeSection:          (id: string) => void
  moveSection:            (fromIndex: number, toIndex: number) => void
  updateSectionProps:     (id: string, partialProps: Record<string, unknown>) => void
  updateSectionTransition:(id: string, transition: SectionTransition) => void
  toggleSectionStickyPin: (id: string) => void
  toggleSectionVisibility:(id: string) => void
  selectSection:          (id: string | null) => void
  duplicateSection:       (id: string) => void
  markSaved:              () => void
  undo:                   () => void
  redo:                   () => void
}

export type PageBuilderStore = PageBuilderState & PageBuilderActions

// ── Collision-resistant unique IDs (no extra deps) ──
// crypto.randomUUID is available in all modern browsers and Node 16.7+.
// The page builder runs client-side, so it is always present here.
// Falls back to a random+time string in any exotic runtime without it.
function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

// ── Store ─────────────────────────────────────────
export const usePageBuilder = create<PageBuilderStore>((set) => ({
  // ── initial state ─────────────────────────────
  page:              null,
  selectedSectionId: null,
  isDirty:           false,
  lastSavedAt:       null,
  _history:          { past: [], future: [] },
  canUndo:           false,
  canRedo:           false,

  // ── setPage ───────────────────────────────────
  setPage: (page) => set({
    page,
    isDirty:           false,
    selectedSectionId: null,
    _history:          { past: [], future: [] },
    canUndo:           false,
    canRedo:           false,
  }),

  // ── setTitle ──────────────────────────────────
  setTitle: (title) => set((s) =>
    s.page ? { page: { ...s.page, title }, isDirty: true } : s
  ),

  // ── setStatus ─────────────────────────────────
  setStatus: (status) => set((s) =>
    s.page ? { page: { ...s.page, status }, isDirty: true } : s
  ),

  // ── addSection ────────────────────────────────
  addSection: (type) => set((state) => {
    if (!state.page) return state
    const meta    = SECTION_REGISTRY[type]
    const sections = state.page.sections
    const newSection: SectionBlock = {
      id:      uid(),
      type,
      order:   sections.length,
      visible: true,
      props:   { ...meta.defaultProps },
    }
    const hist = pushHistory(state._history, sections)
    return {
      page: {
        ...state.page,
        sections: [...sections, newSection],
      },
      isDirty:  true,
      _history: hist,
      canUndo:  hist.past.length > 0,
      canRedo:  false,
    }
  }),

  // ── removeSection ─────────────────────────────
  removeSection: (id) => set((state) => {
    if (!state.page) return state
    const sections = state.page.sections
    const hist     = pushHistory(state._history, sections)
    const updated  = sections
      .filter((s) => s.id !== id)
      .map((s, i) => ({ ...s, order: i }))
    return {
      page: { ...state.page, sections: updated },
      selectedSectionId:
        state.selectedSectionId === id ? null : state.selectedSectionId,
      isDirty:  true,
      _history: hist,
      canUndo:  hist.past.length > 0,
      canRedo:  false,
    }
  }),

  // ── moveSection ───────────────────────────────
  moveSection: (fromIndex, toIndex) => set((state) => {
    if (!state.page) return state
    const sections = [...state.page.sections]
    if (
      fromIndex < 0 || fromIndex >= sections.length ||
      toIndex   < 0 || toIndex   >= sections.length
    ) return state

    const hist = pushHistory(state._history, state.page.sections)
    const [moved] = sections.splice(fromIndex, 1)
    sections.splice(toIndex, 0, moved)
    const reordered = sections.map((s, i) => ({ ...s, order: i }))
    return {
      page: { ...state.page, sections: reordered },
      isDirty:  true,
      _history: hist,
      canUndo:  hist.past.length > 0,
      canRedo:  false,
    }
  }),

  // ── updateSectionProps ────────────────────────
  updateSectionProps: (id, partialProps) => set((state) => {
    if (!state.page) return state
    const sections = state.page.sections.map((s) =>
      s.id === id
        ? { ...s, props: { ...s.props, ...partialProps } }
        : s
    )
    return {
      page: { ...state.page, sections },
      isDirty: true,
    }
  }),

  // ── updateSectionTransition ───────────────────
  updateSectionTransition: (id, transition) => set((state) => {
    if (!state.page) return state
    const sections = state.page.sections.map((s) =>
      s.id === id ? { ...s, transition } : s
    )
    return {
      page: { ...state.page, sections },
      isDirty: true,
    }
  }),

  // ── toggleSectionStickyPin ────────────────────
  toggleSectionStickyPin: (id) => set((state) => {
    if (!state.page) return state
    const sections = state.page.sections.map((s) =>
      s.id === id ? { ...s, stickyPin: !s.stickyPin } : s
    )
    return {
      page: { ...state.page, sections },
      isDirty: true,
    }
  }),

  // ── toggleSectionVisibility ───────────────────
  toggleSectionVisibility: (id) => set((state) => {
    if (!state.page) return state
    const sections = state.page.sections.map((s) =>
      s.id === id ? { ...s, visible: !s.visible } : s
    )
    const hist = pushHistory(state._history, state.page.sections)
    return {
      page: { ...state.page, sections },
      isDirty:  true,
      _history: hist,
      canUndo:  hist.past.length > 0,
      canRedo:  false,
    }
  }),

  // ── selectSection ─────────────────────────────
  selectSection: (id) => set({ selectedSectionId: id }),

  // ── duplicateSection ──────────────────────────
  duplicateSection: (id) => set((state) => {
    if (!state.page) return state
    const sections = state.page.sections
    const idx      = sections.findIndex((s) => s.id === id)
    if (idx === -1) return state

    const original = sections[idx]
    const copy: SectionBlock = {
      ...original,
      id:    uid(),
      order: original.order + 1,
      props: { ...original.props },
    }

    const hist = pushHistory(state._history, sections)
    const next = [
      ...sections.slice(0, idx + 1),
      copy,
      ...sections.slice(idx + 1),
    ].map((s, i) => ({ ...s, order: i }))

    return {
      page: { ...state.page, sections: next },
      isDirty:           true,
      selectedSectionId: copy.id,
      _history:          hist,
      canUndo:           hist.past.length > 0,
      canRedo:           false,
    }
  }),

  // ── markSaved ─────────────────────────────────
  markSaved: () => set({ isDirty: false, lastSavedAt: new Date().toISOString() }),

  // ── undo ──────────────────────────────────────
  undo: () => set((state) => {
    if (!state.page || state._history.past.length === 0) return state
    const past    = state._history.past
    const prev    = past[past.length - 1]
    const newPast = past.slice(0, past.length - 1)
    const newFuture = [state.page.sections, ...state._history.future]
    const hist: HistoryState = { past: newPast, future: newFuture }
    return {
      page:     { ...state.page, sections: prev },
      isDirty:  true,
      _history: hist,
      canUndo:  hist.past.length > 0,
      canRedo:  hist.future.length > 0,
    }
  }),

  // ── redo ──────────────────────────────────────
  redo: () => set((state) => {
    if (!state.page || state._history.future.length === 0) return state
    const future  = state._history.future
    const next    = future[0]
    const newFuture = future.slice(1)
    const newPast   = [...state._history.past, state.page.sections]
    const hist: HistoryState = {
      past:   newPast.length > MAX_HISTORY ? newPast.slice(newPast.length - MAX_HISTORY) : newPast,
      future: newFuture,
    }
    return {
      page:     { ...state.page, sections: next },
      isDirty:  true,
      _history: hist,
      canUndo:  hist.past.length > 0,
      canRedo:  hist.future.length > 0,
    }
  }),
}))
