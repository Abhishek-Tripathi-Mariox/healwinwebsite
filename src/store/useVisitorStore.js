import { create } from "zustand";
import { apiFetch } from "@/lib/api";

let registered = false;

const useVisitorStore = create((set, get) => ({
  visitorNumber: Number(sessionStorage.getItem("hw_visitor_number")) || null,

  /** Register this visit once per session and store the visitor number */
  register: async () => {
    if (registered || get().visitorNumber) return;
    registered = true;

    try {
      const res = await apiFetch("/home-content/visitor/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res?.data?.visitorNumber) {
        set({ visitorNumber: res.data.visitorNumber });
        sessionStorage.setItem(
          "hw_visitor_number",
          String(res.data.visitorNumber),
        );
      }
    } catch {
      registered = false; // allow retry on error
    }
  },
}));

export default useVisitorStore;
