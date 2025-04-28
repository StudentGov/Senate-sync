import { create } from "zustand"

export type UserRole = "senate_member" | "senate_speaker"
export type AgendaType = "current" | "past"

interface AgendaStore {
  agendaType: AgendaType
  setAgendaType: (type: AgendaType) => void
  userRole: UserRole
  setUserRole: (role: UserRole) => void
}

export const useAgendaStore = create<AgendaStore>((set) => ({
  agendaType: "current",
  setAgendaType: (type) => set({ agendaType: type }),
  userRole: "senate_member", // Default role
  setUserRole: (role) => set({ userRole: role }),
}))
