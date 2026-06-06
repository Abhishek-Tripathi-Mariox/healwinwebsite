/**
 * Centralized API client.
 * All API calls go through this module so the base URL is defined in ONE place.
 */
const API_URL =
  process.env.REACT_APP_API_URL || "https://apis.healwin.in/v1/api";

/**
 * Thin wrapper around fetch that:
 *  - prepends API_URL
 *  - parses JSON
 *  - throws on network errors
 */
export const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_URL}${path}`, options);
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }
  return res.json();
};

export { API_URL };
