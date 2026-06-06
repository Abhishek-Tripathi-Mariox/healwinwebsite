import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Phone,
  Star,
  Clock,
  Navigation,
  Filter,
  Building2,
  ArrowRight,
  CheckCircle,
  Shield,
  X,
  Loader2,
} from "lucide-react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  InfoWindowF,
} from "@react-google-maps/api";
import { GOOGLE_MAPS_LOADER_OPTIONS } from "@/lib/googleMaps";

// India map config
const INDIA_CENTER = { lat: 22.3511, lng: 78.6677 };
const INDIA_DEFAULT_ZOOM = 5;

// Restrict map to India region
const INDIA_RESTRICTION = {
  latLngBounds: {
    north: 37.1,
    south: 6.5,
    east: 97.4,
    west: 68.0,
  },
  strictBounds: true,
};

// Google Maps region bias for India (shows correct borders per Indian law)
const MAP_OPTIONS = {
  restriction: INDIA_RESTRICTION,
  minZoom: 5,
  maxZoom: 18,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
  region: "IN", // This tells Google to use India's official boundaries
  styles: [
    {
      featureType: "administrative.country",
      elementType: "geometry.stroke",
      stylers: [{ color: "#4a4a4a" }, { weight: 1.5 }],
    },
  ],
};

// Marker colors by facility type
const getMarkerColor = (type) => {
  switch (type) {
    case "healwin_operated":
      return "#ef4444"; // red-500
    case "healwin_approved":
      return "#22c55e"; // green-500
    default:
      return "#eab308"; // yellow-500
  }
};

const getMarkerIcon = (type) => ({
  path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  fillColor: getMarkerColor(type),
  fillOpacity: 1,
  strokeColor: "#ffffff",
  strokeWeight: 2,
  scale: 1.8,
  anchor: { x: 12, y: 24 },
});
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import useCentreStore from "@/store/useCentreStore";
import useHomeStore from "@/store/useHomeStore";
import { apiFetch } from "@/lib/api";

const CentreLocatorPage = () => {
  // Filter states
  const [selectedStateId, setSelectedStateId] = useState("all");
  const [selectedDistrictId, setSelectedDistrictId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  // Data states
  const [centres, setCentres] = useState([]);
  const storeStates = useCentreStore((s) => s.states);
  const storeServiceTypes = useCentreStore((s) => s.serviceTypes);
  const fetchInitialData = useCentreStore((s) => s.fetchInitialData);
  const homeContent = useHomeStore((s) => s.content);
  const fetchHome = useHomeStore((s) => s.fetchHome);
  const homeHeroImage = homeContent?.heroImage || "";
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load states + service types from store
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);
  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  // Sync store → local state
  useEffect(() => {
    setStates(storeStates);
  }, [storeStates]);
  useEffect(() => {
    setServiceTypes(storeServiceTypes);
  }, [storeServiceTypes]);

  // Load districts when state changes
  useEffect(() => {
    if (selectedStateId === "all") {
      setDistricts([]);
      setSelectedDistrictId("all");
      return;
    }
    const loadDistricts = async () => {
      try {
        const data = await apiFetch(
          `/location/states/${selectedStateId}/districts`,
        );
        setDistricts(data.data || data || []);
      } catch (err) {
        console.error("Failed to load districts:", err);
      }
    };
    loadDistricts();
    setSelectedDistrictId("all");
  }, [selectedStateId]);

  // Search centres when filters change
  useEffect(() => {
    const searchCentres = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.append("q", debouncedSearch);
        if (selectedStateId !== "all") params.append("state", selectedStateId);
        if (selectedDistrictId !== "all")
          params.append("district", selectedDistrictId);
        if (selectedType !== "all") params.append("type", selectedType);
        if (activeTab !== "all") params.append("serviceType", activeTab);

        const data = await apiFetch(`/centres?${params}`);
        setCentres(data.data || data || []);
        setTotalResults((data.data || data || []).length);
      } catch (err) {
        console.error("Failed to search centres:", err);
      } finally {
        setLoading(false);
      }
    };
    searchCentres();
  }, [
    debouncedSearch,
    selectedStateId,
    selectedDistrictId,
    selectedType,
    activeTab,
  ]);

  const getBadgeStyle = (type) => {
    switch (type) {
      case "healwin_operated":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "healwin_approved":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  const getBadgeLabel = (type) => {
    switch (type) {
      case "healwin_operated":
        return "HealWin Operated";
      case "healwin_approved":
        return "HealWin Verified";
      default:
        return "Independent (Unverified)";
    }
  };

  // Map bounds
  const mapCentres = useMemo(() => {
    return centres.filter((c) => c.location?.coordinates?.length === 2);
  }, [centres]);

  const mapCenter = useMemo(() => {
    if (mapCentres.length > 0) {
      const avgLat =
        mapCentres.reduce((s, c) => s + c.location.coordinates[1], 0) /
        mapCentres.length;
      const avgLng =
        mapCentres.reduce((s, c) => s + c.location.coordinates[0], 0) /
        mapCentres.length;
      return { lat: avgLat, lng: avgLng };
    }
    return INDIA_CENTER;
  }, [mapCentres]);

  // Google Maps ref for fitting bounds
  const mapRef = useRef(null);
  const [activeInfoWindow, setActiveInfoWindow] = useState(null);

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  // Fit bounds when markers change
  useEffect(() => {
    if (mapRef.current && mapCentres.length >= 2) {
      const bounds = new window.google.maps.LatLngBounds();
      mapCentres.forEach((c) => {
        bounds.extend({
          lat: c.location.coordinates[1],
          lng: c.location.coordinates[0],
        });
      });
      mapRef.current.fitBounds(bounds, { padding: 40 });
    }
  }, [mapCentres]);

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader(GOOGLE_MAPS_LOADER_OPTIONS);

  const handleDirections = (centre) => {
    if (centre.location?.coordinates?.length === 2) {
      const [lng, lat] = centre.location.coordinates;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        "_blank",
      );
    }
  };

  const handleCall = (phone) => {
    if (phone) window.open(`tel:${phone}`, "_self");
  };

  const hasActiveFilters =
    searchQuery ||
    selectedStateId !== "all" ||
    selectedDistrictId !== "all" ||
    selectedType !== "all";

  return (
    <div className="min-h-screen bg-hw-base" data-testid="centre-locator-page">
      {/* Hero Header */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Layer */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-hw-base via-blue-50/50 to-cyan-50/30" />
          {homeHeroImage && (
            <img
              src={homeHeroImage}
              alt="Hero background"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
          )}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 px-4 pt-12 pb-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 mb-6 text-sm font-medium rounded-full bg-gradient-to-r from-hw-primary/10 to-hw-accent/10 text-hw-primary"
            >
              <MapPin className="w-4 h-4" />
              Find Healthcare Near You
            </motion.span>

            <h1 className="mb-6 text-4xl font-bold font-heading sm:text-5xl lg:text-6xl text-hw-text">
              Locate{" "}
              <span className="text-transparent bg-gradient-to-r from-hw-primary to-hw-accent bg-clip-text">
                Healthcare Centres
              </span>{" "}
              Near You
            </h1>

            <p className="max-w-2xl mx-auto text-lg leading-relaxed text-hw-muted">
              Access our network of verified healthcare facilities, emergency
              centres, and pharmacies across India
            </p>

            <div className="mt-8">
              <Link to="/list-your-locator">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg font-semibold bg-hw-primary text-white hover:bg-hw-primary-dark rounded-xl shadow-lg"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  List Your Centre
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative z-20 px-4 pb-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Dynamic Tab Navigation from Service Types */}
          <div className="flex justify-center px-2 mb-10">
            <TabsList className="bg-white/90 border border-gray-100 p-1.5 rounded-2xl shadow-lg h-auto flex flex-wrap justify-center gap-1">
              <TabsTrigger
                value="all"
                data-testid="tab-all"
                className="whitespace-normal px-5 py-2.5 rounded-xl font-medium text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-hw-primary data-[state=active]:to-hw-primary-dark data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                <Building2 className="w-4 h-4 mr-2" />
                All Centres
              </TabsTrigger>
              {serviceTypes.map((st) => (
                <TabsTrigger
                  key={st._id}
                  value={st._id}
                  data-testid={`tab-${st.slug}`}
                  className="whitespace-normal px-5 py-2.5 rounded-xl font-medium text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-hw-accent data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
                >
                  {st.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Panel - Filters */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="sticky p-6 bg-white border border-gray-100 shadow-xl rounded-3xl top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-hw-primary to-hw-accent">
                    <Filter className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold font-heading text-hw-text">
                    Filters
                  </h3>
                </div>

                {/* Search */}
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-hw-muted">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute w-4 h-4 -translate-y-1/2 left-4 top-1/2 text-hw-muted" />
                    <Input
                      placeholder="Search by name or location..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="py-6 transition-all pl-11 rounded-xl border-hw-primary/10 bg-white/50 focus:bg-white focus:border-hw-primary/30"
                      data-testid="search-input"
                    />
                  </div>
                </div>

                {/* State Filter */}
                <div className="mb-5">
                  <label className="block mb-2 text-sm font-medium text-hw-muted">
                    State
                  </label>
                  <Select
                    value={selectedStateId}
                    onValueChange={setSelectedStateId}
                  >
                    <SelectTrigger
                      data-testid="state-filter"
                      className="py-6 rounded-xl border-hw-primary/10 bg-white/50 focus:bg-white"
                    >
                      <SelectValue placeholder="Select State" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="all" className="rounded-lg">
                        All States
                      </SelectItem>
                      {states.map((state) => (
                        <SelectItem
                          key={state._id}
                          value={state._id}
                          className="rounded-lg"
                        >
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* District Filter (cascading) */}
                {selectedStateId !== "all" && districts.length > 0 && (
                  <div className="mb-5">
                    <label className="block mb-2 text-sm font-medium text-hw-muted">
                      District
                    </label>
                    <Select
                      value={selectedDistrictId}
                      onValueChange={setSelectedDistrictId}
                    >
                      <SelectTrigger
                        data-testid="district-filter"
                        className="py-6 rounded-xl border-hw-primary/10 bg-white/50 focus:bg-white"
                      >
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all" className="rounded-lg">
                          All Districts
                        </SelectItem>
                        {districts.map((district) => (
                          <SelectItem
                            key={district._id}
                            value={district._id}
                            className="rounded-lg"
                          >
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Type Filter */}
                <div className="mb-5">
                  <label className="block mb-3 text-sm font-medium text-hw-muted">
                    Facility Type
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        value: "all",
                        label: "All Facilities",
                        icon: Building2,
                      },
                      {
                        value: "healwin_operated",
                        label: "HealWin Operated",
                        icon: Shield,
                      },
                      {
                        value: "healwin_approved",
                        label: "HealWin Verified",
                        icon: CheckCircle,
                      },
                      {
                        value: "other",
                        label: "Independent (Unverified)",
                        icon: MapPin,
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSelectedType(option.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${
                          selectedType === option.value
                            ? "bg-gradient-to-r from-hw-primary/10 to-hw-accent/10 text-hw-primary font-medium border border-hw-primary/20"
                            : "hover:bg-white/50 text-hw-muted border border-transparent"
                        }`}
                        data-testid={`filter-${option.value}`}
                      >
                        <option.icon
                          className={`w-4 h-4 ${selectedType === option.value ? "text-hw-primary" : "text-hw-muted"}`}
                        />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedStateId("all");
                      setSelectedDistrictId("all");
                      setSelectedType("all");
                    }}
                    className="w-full py-5 text-hw-muted hover:text-hw-primary hover:bg-hw-primary/5 rounded-xl"
                    data-testid="clear-filters-btn"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear All Filters
                  </Button>
                )}

                {/* Quick Stats */}
                <div className="pt-6 mt-6 border-t border-hw-primary/10">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 text-center rounded-xl bg-white/50">
                      <div className="text-2xl font-bold font-heading text-hw-primary">
                        {totalResults}
                      </div>
                      <div className="text-xs text-hw-muted">Results Found</div>
                    </div>
                    <div className="p-3 text-center rounded-xl bg-white/50">
                      <div className="text-2xl font-bold font-heading text-hw-accent">
                        {states.length}
                      </div>
                      <div className="text-xs text-hw-muted">
                        States Covered
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Map & Results */}
            <div className="space-y-8 lg:col-span-8 xl:col-span-9">
              {/* Google Map */}
              <div className="overflow-hidden premium-card rounded-3xl">
                <div className="relative h-80">
                  {!isLoaded ? (
                    <div className="flex items-center justify-center w-full h-full bg-gray-50">
                      <Loader2 className="w-8 h-8 text-hw-primary animate-spin" />
                      <span className="ml-3 text-hw-muted">Loading map...</span>
                    </div>
                  ) : loadError ? (
                    <div className="flex items-center justify-center w-full h-full bg-gray-50">
                      <p className="text-sm text-red-500">
                        Failed to load Google Maps
                      </p>
                    </div>
                  ) : (
                    <GoogleMap
                      mapContainerClassName="w-full h-full"
                      center={
                        mapCentres.length === 1
                          ? {
                              lat: mapCentres[0].location.coordinates[1],
                              lng: mapCentres[0].location.coordinates[0],
                            }
                          : mapCenter
                      }
                      zoom={mapCentres.length === 1 ? 13 : INDIA_DEFAULT_ZOOM}
                      options={MAP_OPTIONS}
                      onLoad={onMapLoad}
                    >
                      {mapCentres.map((centre) => (
                        <MarkerF
                          key={centre._id}
                          position={{
                            lat: centre.location.coordinates[1],
                            lng: centre.location.coordinates[0],
                          }}
                          icon={getMarkerIcon(centre.type)}
                          onClick={() => setActiveInfoWindow(centre._id)}
                        >
                          {activeInfoWindow === centre._id && (
                            <InfoWindowF
                              onCloseClick={() => setActiveInfoWindow(null)}
                            >
                              <div className="min-w-[240px] p-1">
                                <h4 className="mb-1 text-sm font-bold">
                                  {centre.name}
                                </h4>
                                <p className="mb-1 text-xs text-gray-600">
                                  {centre.address}
                                </p>
                                {centre.phone && (
                                  <p className="text-xs text-gray-600">
                                    <strong>Phone:</strong> {centre.phone}
                                  </p>
                                )}
                                <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100">
                                  {getBadgeLabel(centre.type)}
                                </span>
                                <div className="flex gap-2 mt-3">
                                  <button
                                    type="button"
                                    onClick={() => handleDirections(centre)}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-md bg-gradient-to-r from-hw-primary to-hw-accent px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:opacity-95"
                                  >
                                    <Navigation className="w-3.5 h-3.5" />
                                    Directions
                                  </button>
                                  {centre.phone && (
                                    <button
                                      type="button"
                                      onClick={() => handleCall(centre.phone)}
                                      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-hw-primary/30 px-3 py-1.5 text-xs font-medium text-hw-primary hover:bg-hw-primary/5"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                      Call
                                    </button>
                                  )}
                                </div>
                              </div>
                            </InfoWindowF>
                          )}
                        </MarkerF>
                      ))}
                    </GoogleMap>
                  )}
                </div>

                {/* Map Legend */}
                {mapCentres.length > 0 && (
                  <div className="flex flex-wrap gap-4 px-5 py-3 text-xs border-t border-gray-100 bg-white/80">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500" />{" "}
                      HealWin Operated
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-green-500 rounded-full" />{" "}
                      HealWin Verified
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full" />{" "}
                      Independent (Unverified)
                    </span>
                  </div>
                )}
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 mr-3 text-hw-primary animate-spin" />
                  <span className="text-hw-muted">Searching centres...</span>
                </div>
              )}

              {/* Results */}
              {!loading && (
                <div className="space-y-5">
                  {centres.map((centre) => (
                    <div
                      key={centre._id}
                      className="overflow-hidden premium-card rounded-2xl group"
                      data-testid={`centre-card-${centre._id}`}
                    >
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="relative h-44 overflow-hidden md:w-52 md:h-auto md:min-h-[180px] shrink-0">
                          {centre.image ? (
                            <img
                              src={centre.image}
                              alt={centre.name}
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-hw-primary/10 to-hw-accent/10">
                              <Building2 className="w-12 h-12 text-hw-primary/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <Badge
                            className={`${getBadgeStyle(centre.type)} absolute top-3 left-3 text-xs shadow-lg border`}
                          >
                            {getBadgeLabel(centre.type)}
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {centre.rating > 0 && (
                                  <>
                                    <span className="flex items-center gap-1 text-sm font-medium text-hw-accent">
                                      <Star className="w-4 h-4 fill-hw-accent text-hw-accent" />
                                      {centre.rating}
                                    </span>
                                    <span className="text-sm text-hw-muted">
                                      •
                                    </span>
                                  </>
                                )}
                                {centre.state?.name && (
                                  <span className="flex items-center gap-1 text-sm text-hw-muted">
                                    <Navigation className="w-3 h-3" />
                                    {centre.district?.name
                                      ? `${centre.district.name}, `
                                      : ""}
                                    {centre.state.name}
                                  </span>
                                )}
                              </div>

                              <h3 className="mb-2 text-xl font-bold transition-colors font-heading text-hw-text group-hover:text-hw-primary">
                                {centre.name}
                              </h3>

                              <p className="flex items-start gap-2 mb-3 text-sm text-hw-muted">
                                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-hw-primary/60" />
                                {centre.address}
                              </p>

                              {/* Services */}
                              {centre.services?.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {centre.services.map((service, i) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1 text-xs font-medium rounded-full bg-hw-primary/5 text-hw-primary"
                                    >
                                      {service}
                                    </span>
                                  ))}
                                </div>
                              )}

                              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-hw-muted">
                                {centre.timings && (
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-hw-accent shrink-0" />
                                    <span className="truncate">
                                      {centre.timings}
                                    </span>
                                  </span>
                                )}
                                {centre.phone && (
                                  <span className="flex items-center gap-1.5">
                                    <Phone className="w-4 h-4 text-hw-primary shrink-0" />
                                    {centre.phone}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-row gap-3 lg:flex-col">
                              <Button
                                onClick={() => handleDirections(centre)}
                                className="shadow-lg btn-gradient rounded-xl shadow-hw-primary/20 hover:shadow-hw-primary/40"
                                data-testid={`directions-btn-${centre._id}`}
                              >
                                <Navigation className="w-4 h-4 mr-2" />
                                Directions
                              </Button>
                              {centre.phone && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleCall(centre.phone)}
                                  className="rounded-xl border-hw-primary/20 text-hw-primary hover:bg-hw-primary/5"
                                >
                                  <Phone className="w-4 h-4 mr-2" />
                                  Call
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {centres.length === 0 && !loading && (
                    <div className="p-16 text-center premium-card rounded-3xl">
                      <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 rounded-full bg-hw-primary/10">
                        <Building2 className="w-10 h-10 text-hw-primary/50" />
                      </div>
                      <h3 className="mb-2 text-xl font-bold font-heading text-hw-text">
                        No centres found
                      </h3>
                      <p className="text-hw-muted">
                        Try adjusting your filters or search query
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Tabs>
      </section>

      {/* Bottom CTA Section */}
      <section className="relative px-4 py-20 overflow-hidden sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-hw-primary to-hw-primary-dark" />
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div>
            <h2 className="mb-4 text-3xl font-bold text-white font-heading sm:text-4xl">
              Can't find what you're looking for?
            </h2>
            <p className="max-w-2xl mx-auto mb-8 text-lg text-white/80">
              Our 24/7 helpline is always available to assist you in finding the
              nearest healthcare facility or emergency service.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="px-8 py-6 text-lg font-semibold bg-white shadow-xl text-hw-primary hover:bg-white/90 rounded-xl"
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Helpline
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg text-white border-2 border-white/30 hover:bg-white/10 rounded-xl"
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                View All Services
              </Button>
              <Link to="/list-your-locator">
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 py-6 text-lg text-white border-2 border-white/30 hover:bg-white/10 rounded-xl"
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  List Your Centre
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CentreLocatorPage;
