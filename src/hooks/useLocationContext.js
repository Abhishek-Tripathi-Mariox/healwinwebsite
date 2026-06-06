import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

const LocationContext = createContext(null);

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation must be used within LocationProvider");
  return ctx;
};

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [locationError, setLocationError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(loc);
        setIsLocating(false);
        setHasAsked(true);
        // Cache in sessionStorage
        sessionStorage.setItem("healwin_user_location", JSON.stringify(loc));
      },
      (error) => {
        let msg = "Unable to get your location";
        if (error.code === 1) msg = "Location access denied";
        else if (error.code === 2) msg = "Location unavailable";
        else if (error.code === 3) msg = "Location request timed out";
        setLocationError(msg);
        setIsLocating(false);
        setHasAsked(true);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // cache for 5 min
      },
    );
  }, []);

  // On mount, check sessionStorage first, then auto-request
  useEffect(() => {
    const cached = sessionStorage.getItem("healwin_user_location");
    if (cached) {
      try {
        const loc = JSON.parse(cached);
        setUserLocation(loc);
        setHasAsked(true);
        return;
      } catch {
        // ignore
      }
    }
    // Auto-request on first visit
    requestLocation();
  }, [requestLocation]);

  return (
    <LocationContext.Provider
      value={{
        userLocation,
        locationError,
        isLocating,
        hasAsked,
        requestLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export default LocationProvider;
