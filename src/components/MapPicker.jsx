import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
import { GOOGLE_MAPS_LOADER_OPTIONS } from "@/lib/googleMaps";

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: 20.5937, lng: 78.9629 }; // India center

const extractAddressComponents = (results) => {
  if (!results || !results.length) return {};
  const components = results[0].address_components || [];
  let state = "";
  let district = "";
  let city = "";
  for (const c of components) {
    if (c.types.includes("administrative_area_level_1")) state = c.long_name;
    if (c.types.includes("administrative_area_level_3")) district = c.long_name;
    if (c.types.includes("locality")) city = c.long_name;
  }
  return { state, district: district || city };
};

const MapPicker = ({ value, onChange }) => {
  const { isLoaded } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);

  const [position, setPosition] = useState({
    lat: value?.lat || defaultCenter.lat,
    lng: value?.lng || defaultCenter.lng,
  });
  const [address, setAddress] = useState(value?.address || "");
  const [zoom, setZoom] = useState(value?.lat ? 15 : 5);
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (value?.lat && value?.lng) {
      setPosition({ lat: value.lat, lng: value.lng });
      setAddress(value.address || "");
    }
  }, [value?.lat, value?.lng, value?.address]);

  const reverseGeocode = useCallback((lat, lng) => {
    if (!window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const addr = results[0].formatted_address;
        const { state, district } = extractAddressComponents(results);
        setAddress(addr);
        onChange({ lat, lng, address: addr, state, district });
      } else {
        const addr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        setAddress(addr);
        onChange({ lat, lng, address: addr, state: "", district: "" });
      }
    });
  }, [onChange]);

  const handleMapClick = useCallback((e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setPosition({ lat, lng });
    setZoom(15);
    reverseGeocode(lat, lng);
  }, [reverseGeocode]);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onAutocompleteLoad = useCallback((ac) => {
    autocompleteRef.current = ac;
  }, []);

  const geocodeByText = useCallback((text) => {
    if (!window.google || !text) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { address: text, componentRestrictions: { country: "in" } },
      (results, status) => {
        if (status === "OK" && results[0]) {
          const loc = results[0].geometry.location;
          const lat = loc.lat();
          const lng = loc.lng();
          const addr = results[0].formatted_address || text;
          const { state, district } = extractAddressComponents(results);
          setPosition({ lat, lng });
          setAddress(addr);
          setZoom(15);
          onChange({ lat, lng, address: addr, state, district });
          if (mapRef.current) mapRef.current.panTo({ lat, lng });
        }
      }
    );
  }, [onChange]);

  const onPlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) return;
    const place = autocompleteRef.current.getPlace();
    if (!place) return;
    if (place.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const addr = place.formatted_address || place.name || "";
      const { state, district } = extractAddressComponents([place]);
      setPosition({ lat, lng });
      setAddress(addr);
      setZoom(15);
      onChange({ lat, lng, address: addr, state, district });
      if (mapRef.current) {
        mapRef.current.panTo({ lat, lng });
      }
    } else if (place.name) {
      geocodeByText(place.name);
    }
  }, [onChange, geocodeByText]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setPosition({ lat, lng });
        setZoom(15);
        if (mapRef.current) mapRef.current.panTo({ lat, lng });
        reverseGeocode(lat, lng);
      },
      () => alert("Unable to get your location. Please allow location access.")
    );
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-[280px] border border-gray-200 rounded-xl bg-gray-50">
        <p className="text-sm text-gray-400">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <div className="flex gap-2">
          <Autocomplete
            onLoad={onAutocompleteLoad}
            onPlaceChanged={onPlaceChanged}
            options={{ componentRestrictions: { country: "in" } }}
            fields={["geometry", "formatted_address", "name", "address_components"]}
            className="flex-1"
          >
            <input
              type="text"
              placeholder="Search address (e.g. AIIMS Delhi, MG Road Bangalore)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-hw-primary focus:outline-none"
            />
          </Autocomplete>
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="px-3 py-2 text-xs font-medium text-hw-primary bg-hw-primary/10 rounded-lg hover:bg-hw-primary/20 whitespace-nowrap transition-colors"
          >
            📍 My Location
          </button>
        </div>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: "280px" }}>
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={position}
          zoom={zoom}
          onClick={handleMapClick}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          <Marker position={position} />
        </GoogleMap>
      </div>

      {/* Selected Location Display */}
      {address && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-1">Pinned Location:</p>
          <p className="text-sm text-gray-800">{address}</p>
          <p className="text-xs text-gray-400 mt-1">
            Coordinates: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Search for your address or click anywhere on the map to pin your centre's location.
      </p>
    </div>
  );
};

export default MapPicker;
