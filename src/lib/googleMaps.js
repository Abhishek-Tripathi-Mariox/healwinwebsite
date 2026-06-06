export const GOOGLE_MAPS_LOADER_OPTIONS = {
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || "",
  libraries: ["places"],
  region: "IN",
  language: "en",
};
