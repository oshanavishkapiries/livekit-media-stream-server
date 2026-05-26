const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function fetchToken({ roomName, participantName, participantRole }) {
  const res = await fetch(`${API_BASE}/livekit/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roomName, participantName, participantRole }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || `Server error: ${res.status}`);
  }

  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend unavailable");
  return res.json();
}
