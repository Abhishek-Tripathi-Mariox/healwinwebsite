import { create } from "zustand";
import { apiFetch } from "@/lib/api";

const useHomeStore = create((set, get) => ({
  content: null,
  loaded: false,
  loading: false,

  fetchHome: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const json = await apiFetch("/home-content");
      if (json.data) set({ content: json.data, loaded: true });
    } catch {
      // keep empty
    } finally {
      set({ loading: false });
    }
  },
}));

export default useHomeStore;
