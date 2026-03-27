const ADMIN_KEY = "h2s_admin_session";

export function setAdminSession(principal: string) {
  localStorage.setItem(
    ADMIN_KEY,
    JSON.stringify({ principal, ts: Date.now() }),
  );
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_KEY);
}

export function isAdminSessionActive(): boolean {
  try {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    // Session valid for 24h
    return Date.now() - data.ts < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}
