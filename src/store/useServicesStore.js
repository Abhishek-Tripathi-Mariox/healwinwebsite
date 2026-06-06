import { create } from "zustand";
import { apiFetch } from "@/lib/api";

const useServicesStore = create((set, get) => ({
  services: [],
  loaded: false,
  loading: false,

  fetchServices: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const data = await apiFetch("/services");
      if (data.success) {
        set({ services: data.data || [], loaded: true });
      }
    } catch (err) {
      console.error("Failed to fetch services:", err);
    } finally {
      set({ loading: false });
    }
  },
}));

export default useServicesStore;
