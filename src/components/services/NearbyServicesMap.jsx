import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { X, MapPin, Navigation, Loader2 } from "lucide-react";
import { useLocation as useUserLocation } from "@/hooks/useLocationContext";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom icon for service locations
const serviceIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

import { API_URL } from "@/lib/api";

// Auto-fit bounds
const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      const leafletBounds = L.latLngBounds(bounds);
      map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
};

const NearbyServicesMap = ({ isOpen, onClose, serviceTitle, categoryId }) => {
  const { userLocation, isLocating, requestLocation } = useUserLocation();
  const [nearbyServices, setNearbyServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen || !userLocation) return;

    const fetchNearby = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          lat: String(userLocation.lat),
          lng: String(userLocation.lng),
          maxDistance: "50000", // 50km radius
        });
        if (categoryId) params.append("category", categoryId);

        const res = await fetch(`${API_URL}/services/nearby?${params}`);
        const data = await res.json();
        if (data.success) {
          setNearbyServices(data.data || []);
        } else {
          setError("Failed to load nearby services");
        }
      } catch (err) {
        setError("Failed to fetch nearby services");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearby();
  }, [isOpen, userLocation, categoryId]);

  if (!isOpen) return null;

  // Prepare map bounds
  const allPoints = [];
  if (userLocation) {
    allPoints.push([userLocation.lat, userLocation.lng]);
  }
  nearbyServices.forEach((s) => {
    if (s.location?.coordinates) {
      allPoints.push([s.location.coordinates[1], s.location.coordinates[0]]);
    }
  });

  const defaultCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [26.1445, 91.7362]; // Guwahati fallback

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-hw-primary to-hw-accent">
          <div className="flex items-center gap-3 text-white">
            <MapPin className="w-5 h-5" />
            <div>
              <h3 className="font-bold text-lg">
                {serviceTitle ? `${serviceTitle} — Nearby` : "Nearby Centres"}
              </h3>
              <p className="text-sm text-white/80">
                {nearbyServices.length} location
                {nearbyServices.length !== 1 ? "s" : ""} found near you
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Map */}
          <div className="flex-1 min-h-[350px]">
            {!userLocation && !isLocating ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
                <Navigation className="w-12 h-12 text-hw-primary" />
                <p className="text-hw-muted text-center">
                  We need your location to show nearby centres
                </p>
                <button
                  onClick={requestLocation}
                  className="px-6 py-3 bg-hw-primary text-white rounded-xl font-medium hover:bg-hw-primary-dark transition"
                >
                  Allow Location Access
                </button>
              </div>
            ) : isLocating || loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-hw-primary animate-spin" />
                <p className="text-hw-muted">
                  {isLocating
                    ? "Getting your location..."
                    : "Finding nearby services..."}
                </p>
              </div>
            ) : (
              <MapContainer
                center={defaultCenter}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User location marker */}
                {userLocation && (
                  <>
                    <Marker
                      position={[userLocation.lat, userLocation.lng]}
                      icon={userIcon}
                    >
                      <Popup>
                        <strong>📍 Your Location</strong>
                      </Popup>
                    </Marker>
                    <Circle
                      center={[userLocation.lat, userLocation.lng]}
                      radius={500}
                      pathOptions={{
                        color: "#3b82f6",
                        fillOpacity: 0.1,
                        weight: 1,
                      }}
                    />
                  </>
                )}

                {/* Service location markers */}
                {nearbyServices.map((service, i) => {
                  if (!service.location?.coordinates) return null;
                  const [lng, lat] = service.location.coordinates;
                  return (
                    <Marker
                      key={service._id || i}
                      position={[lat, lng]}
                      icon={serviceIcon}
                    >
                      <Popup>
                        <div className="min-w-[200px]">
                          <strong className="text-sm">{service.title}</strong>
                          {service.location.address && (
                            <p className="text-xs text-gray-500 mt-1">
                              {service.location.address}
                            </p>
                          )}
                          {service.subtitle && (
                            <p className="text-xs text-blue-600 mt-1">
                              {service.subtitle}
                            </p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* Auto-fit bounds */}
                {allPoints.length > 1 && <FitBounds bounds={allPoints} />}
              </MapContainer>
            )}
          </div>

          {/* Sidebar list */}
          <div className="lg:w-72 border-t lg:border-t-0 lg:border-l overflow-y-auto max-h-[30vh] lg:max-h-none">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50">{error}</div>
            )}

            {!loading && nearbyServices.length === 0 && !error && (
              <div className="p-6 text-center text-sm text-gray-500">
                No services found nearby. Try expanding the search area.
              </div>
            )}

            {nearbyServices.map((service, i) => (
              <div
                key={service._id || i}
                className="p-4 border-b hover:bg-blue-50/50 transition cursor-pointer"
              >
                <h4 className="text-sm font-semibold text-gray-800">
                  {service.title}
                </h4>
                {service.subtitle && (
                  <p className="text-xs text-blue-600 mt-0.5">
                    {service.subtitle}
                  </p>
                )}
                {service.location?.address && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    📍 {service.location.address}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyServicesMap;
