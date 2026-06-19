import { create } from 'zustand'

interface UIState {
  isMobileDockVisible: boolean
  setMobileDockVisible: (visible: boolean) => void
  isAppointmentModalOpen: boolean
  setAppointmentModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  isMobileDockVisible: true,
  setMobileDockVisible: (visible) => set({ isMobileDockVisible: visible }),
  isAppointmentModalOpen: false,
  setAppointmentModalOpen: (open) => set({ isAppointmentModalOpen: open }),
}))

