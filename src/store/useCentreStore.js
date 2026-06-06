import { create } from "zustand";
import { apiFetch } from "@/lib/api";

const useCentreStore = create((set, get) => ({
  states: [],
  serviceTypes: [],
  districts: [],
  centres: [],
  statesLoaded: false,
  loading: false,

  fetchInitialData: async () => {
    if (get().statesLoaded) return;
    set({ loading: true });
    try {
      const [statesRes, typesRes] = await Promise.all([
        apiFetch("/location/states"),
        apiFetch("/centres/service-types"),
      ]);
      set({
        states: statesRes.data || [],
        serviceTypes: typesRes.data || [],
        statesLoaded: true,
      });
    } catch {
      // keep empty
    } finally {
      set({ loading: false });
    }
  },

  fetchDistricts: async (stateId) => {
    try {
      const json = await apiFetch(`/location/states/${stateId}/districts`);
      set({ districts: json.data || [] });
    } catch {
      set({ districts: [] });
    }
  },

  fetchCentres: async (params) => {
    set({ loading: true });
    try {
      const res = await apiFetch(`/centres?${params}`);
      set({ centres: res.data || [] });
    } catch {
      set({ centres: [] });
    } finally {
      set({ loading: false });
    }
  },
}));

export default useCentreStore;
