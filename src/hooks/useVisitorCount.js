import { useEffect } from "react";
import useVisitorStore from "@/store/useVisitorStore";

/**
 * Registers the visitor once per session and returns the cumulative visitor number.
 */
const useVisitorCount = () => {
  const visitorNumber = useVisitorStore((s) => s.visitorNumber);
  const register = useVisitorStore((s) => s.register);

  useEffect(() => {
    register();
  }, [register]);

  return visitorNumber;
};

export default useVisitorCount;
