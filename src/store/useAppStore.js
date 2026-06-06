/**
 * Global app store – logo settings & contact data.
 * These are fetched once (by Navbar / Footer on mount) and reused everywhere.
 */
import { create } from "zustand";
import { apiFetch } from "@/lib/api";

const useAppStore = create((set, get) => ({
  // ── Logo ──────────────────────────────────────────────
  logoSettings: { mainLogo: "", titleLogo: "" },
  logoLoaded: false,

  fetchLogo: async () => {
    if (get().logoLoaded) return;
    try {
      const json = await apiFetch("/logo");
      const data = json?.data || json;
      set({ logoSettings: data, logoLoaded: true });

      // Set browser tab favicon
      if (data.titleLogo) {
        let link = document.querySelector("link[rel='icon']");
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = data.titleLogo;
      }
      document.title = "HealWin | Your Life, Our Mission";
    } catch {
      // silently fail
    }
  },

  // ── Contact (global) ─────────────────────────────────
  contactData: null,
  contactLoaded: false,

  fetchContact: async () => {
    if (get().contactLoaded) return;
    try {
      const json = await apiFetch("/contact");
      if (json.data) set({ contactData: json.data, contactLoaded: true });
    } catch {
      // silently fail
    }
  },
}));

export default useAppStore;
