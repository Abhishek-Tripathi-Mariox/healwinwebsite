import { create } from "zustand";
import { apiFetch } from "@/lib/api";

const useNewsStore = create((set, get) => ({
  articles: [],
  gallery: [],
  categories: [],
  loaded: false,
  loading: false,

  fetchNews: async () => {
    if (get().loading) return;
    set({ loading: true });
    try {
      const [articlesRes, galleryRes, categoriesRes] = await Promise.all([
        apiFetch("/news-gallery/articles"),
        apiFetch("/news-gallery/gallery"),
        apiFetch("/service-categories"),
      ]);
      set({
        articles: articlesRes.data || [],
        gallery: galleryRes.data || [],
        categories: categoriesRes.data || [],
        loaded: true,
      });
    } catch {
      // keep empty
    } finally {
      set({ loading: false });
    }
  },
}));

export default useNewsStore;
