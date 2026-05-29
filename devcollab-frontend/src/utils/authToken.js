export function getAccessToken() {
  const direct = localStorage.getItem('token');
  if (direct) return direct.replace(/^Bearer\s+/i, '');
  try {
    const raw = localStorage.getItem('auth-storage');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token?.replace(/^Bearer\s+/i, '') ?? null;
  } catch {
    return null;
  }
}

export function setAccessToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

export function clearAuthStorage() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('auth-storage');
}
