import axios from "axios";

// Keep production API calls on the Vercel origin. Vercel proxies /api to
// Render, which makes the HTTP-only session cookie first-party in browsers.
const baseURL = import.meta.env.DEV
  ? import.meta.env.VITE_API_BASE_URL || "/api"
  : "/api";

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

/**
 * Standardize error extraction from backend API responses.
 * Backend responses follow the structure:
 * {
 *   success: false,
 *   message: string,
 *   errors?: Array<{ field: string, message: string }>
 * }
 */
export function formatApiError(error) {
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return {
        message: "The request timed out. Please check your network and try again.",
        status: 408,
      };
    }
    return {
      message: "Network error. Please make sure the server is reachable.",
      status: 0,
    };
  }

  const { status, data, headers } = error.response;
  let message = data?.message;

  switch (status) {
    case 400:
      message = message || "Invalid request. Please check your inputs.";
      break;
    case 401:
      message = message || "Authentication failed or session expired.";
      break;
    case 403:
      message = message || "Access denied. Please verify your account.";
      break;
    case 404:
      message = message || "The requested resource was not found.";
      break;
    case 409:
      message = message || "An account with these details already exists.";
      break;
    case 429: {
      const retryAfter = headers?.["retry-after"] || headers?.["ratelimit-reset"];
      if (retryAfter) {
        const secs = parseInt(retryAfter, 10);
        message = `Too many requests. Please wait ${secs || retryAfter} second${secs === 1 ? "" : "s"} before trying again.`;
      } else {
        message = message || "Too many requests. Please slow down and try again later.";
      }
      break;
    }
    case 500:
    case 502:
    case 503:
      message = message || "Server error. Our team has been notified.";
      break;
    default:
      message = message || `An unexpected error occurred (Code: ${status}).`;
  }

  return {
    status,
    message,
    errors: data?.errors || [],
    raw: data,
  };
}

// Global response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const formatted = formatApiError(error);
    return Promise.reject(formatted);
  }
);

export default apiClient;
