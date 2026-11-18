import { auth } from "./firebase";

const BASE = import.meta.env.VITE_API_URL || "http://192.168.100.9:4000";

// Every call sends the Firebase ID token; the server verifies it.
export async function api(path, { method = "GET", body } = {}) {
  const token = await auth.currentUser.getIdToken();
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Cannot reach the server. Make sure the backend is running.");
  }
  const data = res.status === 204 ? null : await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.error || "Request failed."), { status: res.status, details: data?.details });
  return data;
}
