import { create } from "zustand";

const useSOSStore = create((set) => ({
  triggerCall: false,
  fireTrigger: () => set({ triggerCall: true }),
  resetTrigger: () => set({ triggerCall: false }),
}));

export default useSOSStore;
