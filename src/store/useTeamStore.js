import { create } from "zustand";
import { apiFetch } from "@/lib/api";

const useTeamStore = create((set, get) => ({
  members: [],
  loaded: false,
  loading: false,

  fetchTeam: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await apiFetch("/team");
      if (data.success) {
        set({ members: data.data || [], loaded: true });
      }
    } catch {
      // fallback
    } finally {
      set({ loading: false });
    }
  },
}));

export default useTeamStore;
