import { create } from "zustand";
import { apiFetch } from "@/lib/api";

const useCareersStore = create((set, get) => ({
  jobs: [],
  loaded: false,
  loading: false,

  fetchCareers: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await apiFetch("/careers");
      if (data.success && data.data) {
        set({ jobs: data.data, loaded: true });
      }
    } catch {
      // keep empty
    } finally {
      set({ loading: false });
    }
  },
}));

export default useCareersStore;
