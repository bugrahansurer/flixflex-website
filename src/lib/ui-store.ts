import { create } from 'zustand'
import * as React from 'react'

/** Background tone behind the transparent header.
 *  'dark'  → dark background  → white text/buttons
 *  'light' → light background → black text/buttons
 *  'theme' → follow the active theme (default) */
export type HeaderTone = 'light' | 'dark' | 'theme'

interface UIState {
  isMobileDockVisible: boolean
  setMobileDockVisible: (visible: boolean) => void
  isAppointmentModalOpen: boolean
  setAppointmentModalOpen: (open: boolean) => void
  headerTone: HeaderTone
  setHeaderTone: (tone: HeaderTone) => void
}

export const useUIStore = create<UIState>((set) => ({
  isMobileDockVisible: true,
  setMobileDockVisible: (visible) => set({ isMobileDockVisible: visible }),
  isAppointmentModalOpen: false,
  setAppointmentModalOpen: (open) => set({ isAppointmentModalOpen: open }),
  headerTone: 'theme',
  setHeaderTone: (tone) => set({ headerTone: tone }),
}))

/** Declare the background tone behind the transparent header for the lifetime of
 *  the calling component; resets to 'theme' on unmount. Use in full-bleed heroes
 *  whose background is fixed regardless of theme (e.g. a dark video hero). */
export function useHeaderTone(tone: HeaderTone) {
  const setHeaderTone = useUIStore((s) => s.setHeaderTone)
  React.useEffect(() => {
    setHeaderTone(tone)
    return () => setHeaderTone('theme')
  }, [tone, setHeaderTone])
}
