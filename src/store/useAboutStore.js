import { create } from "zustand";
import { apiFetch } from "@/lib/api";

const DEFAULT_DATA = {
  heroBadge: "About HealWin",
  heroTitle: "Transforming Healthcare in",
  heroHighlight: "Northeast India",
  heroSubtitle: "",
  stats: [],
  missionTitle: "Our Mission",
  missionText: "",
  visionTitle: "Our Vision",
  visionText: "",
  valuesHeading: "Our Core Values",
  valuesSubheading: "",
  coreValues: [],
  storyTitle: "Our Story",
  storyParagraphs: [],
};

const useAboutStore = create((set) => ({
  data: DEFAULT_DATA,
  loaded: false,

  fetchAbout: async () => {
    try {
      const json = await apiFetch("/about");
      if (json.success && json.data) {
        set({ data: { ...DEFAULT_DATA, ...json.data }, loaded: true });
      }
    } catch {
      // keep defaults
    }
  },
}));

export default useAboutStore;
