import { create } from "zustand";
import { apiFetch } from "@/lib/api";

/**
 * Store for CMS pages: business, financial-services, health-card.
 * Each page's data is cached independently.
 */
const useCmsStore = create((set, get) => ({
  pages: {}, // { "business": { data, loaded } }

  fetchPage: async (slug) => {
    const existing = get().pages[slug];
    if (existing?.loading) return;
    set((state) => ({
      pages: {
        ...state.pages,
        [slug]: { ...(existing || { data: null }), loading: true },
      },
    }));
    try {
      const json = await apiFetch(`/cms/${slug}`);
      set((state) => ({
        pages: {
          ...state.pages,
          [slug]: { data: json.data || null, loaded: true, loading: false },
        },
      }));
    } catch {
      set((state) => ({
        pages: {
          ...state.pages,
          [slug]: { data: existing?.data || null, loaded: true, loading: false },
        },
      }));
    }
  },

  getPage: (slug) => get().pages[slug]?.data || null,
  isLoaded: (slug) => !!get().pages[slug]?.loaded,
}));

export default useCmsStore;
