const BACKEND_URL = (process.env.BACKEND_URL || "http://localhost:8000").trim();
const API_PREFIX = (process.env.BACKEND_API_PREFIX || "/api").trim();
const PROXZAR_URL = (process.env.PROXZAR_OAUTH_URL || "https://oauth2.proxzar.ai").trim();

export const API_BASE = `${BACKEND_URL}${API_PREFIX}`;
export const PROXZAR_BASE = PROXZAR_URL;
