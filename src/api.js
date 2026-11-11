// Base URL of the Express backend
export const API_URL = "http://localhost:5000/api";

// Small fetch wrapper used by every request to the backend.
// credentials: "include" makes the browser send (and accept) the HttpOnly
// "token" cookie that the backend sets on login. That cookie IS the JWT.
export async function request(path, options = {}) {
  const response = await fetch(API_URL + path, {
    credentials: "include",
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // The backend always sends errors as { message }
    const error = new Error(data.message || "Request failed");
    error.status = response.status;
    throw error;
  }

  return data;
}

// Helper for JSON POST requests (register / login / logout)
export function postJson(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}
