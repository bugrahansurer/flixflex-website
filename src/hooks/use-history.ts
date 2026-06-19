// ═══════════════════════════════════════════════════════════
// FlixFlex — Undo/Redo History Hook
// ═══════════════════════════════════════════════════════════

import { useState, useCallback, useEffect, useRef } from "react"
import type { SectionBlock } from "@/types/page-builder"

const MAX_HISTORY = 50

// The snapshot shape is just the sections array
export type HistorySnapshot = SectionBlock[]

export interface UseHistoryReturn {
  push: (snapshot: HistorySnapshot) => void
  undo: () => HistorySnapshot | undefined
  redo: () => HistorySnapshot | undefined
  canUndo: boolean
  canRedo: boolean
  present: HistorySnapshot | undefined
}

export function useHistory(
  onUndo: (snapshot: HistorySnapshot) => void,
  onRedo: (snapshot: HistorySnapshot) => void
): UseHistoryReturn {
  const [past, setPast]     = useState<HistorySnapshot[]>([])
  const [present, setPresent] = useState<HistorySnapshot | undefined>(undefined)
  const [future, setFuture] = useState<HistorySnapshot[]>([])

  const push = useCallback((snapshot: HistorySnapshot) => {
    setPast((prev) => {
      const next = [...prev, ...(present !== undefined ? [present] : [])]
      return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next
    })
    setPresent(snapshot)
    setFuture([])
  }, [present])

  const undo = useCallback((): HistorySnapshot | undefined => {
    if (past.length === 0) return undefined
    const previous = past[past.length - 1]
    setPast((p) => p.slice(0, p.length - 1))
    setFuture((f) => [
      ...(present !== undefined ? [present] : []),
      ...f,
    ])
    setPresent(previous)
    onUndo(previous)
    return previous
  }, [past, present, onUndo])

  const redo = useCallback((): HistorySnapshot | undefined => {
    if (future.length === 0) return undefined
    const next = future[0]
    setFuture((f) => f.slice(1))
    setPast((p) => [
      ...p,
      ...(present !== undefined ? [present] : []),
    ])
    setPresent(next)
    onRedo(next)
    return next
  }, [future, present, onRedo])

  return {
    push,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    present,
  }
}

// ── Keyboard shortcut hook ────────────────────────
export function useUndoRedoKeys(
  canUndo: boolean,
  canRedo: boolean,
  onUndo: () => void,
  onRedo: () => void
) {
  // Use ref to always capture latest callbacks without re-binding
  const onUndoRef = useRef(onUndo)
  const onRedoRef = useRef(onRedo)
  const canUndoRef = useRef(canUndo)
  const canRedoRef = useRef(canRedo)

  useEffect(() => { onUndoRef.current = onUndo }, [onUndo])
  useEffect(() => { onRedoRef.current = onRedo }, [onRedo])
  useEffect(() => { canUndoRef.current = canUndo }, [canUndo])
  useEffect(() => { canRedoRef.current = canRedo }, [canRedo])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes("MAC")
      const ctrl  = isMac ? e.metaKey : e.ctrlKey

      if (!ctrl) return

      if (e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        if (canUndoRef.current) onUndoRef.current()
      }
      if ((e.key === "z" && e.shiftKey) || e.key === "y") {
        e.preventDefault()
        if (canRedoRef.current) onRedoRef.current()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, []) // empty deps: only bind once, refs handle the rest
}
