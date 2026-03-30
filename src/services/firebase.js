const TOKEN_KEY = "lifeflow-access-token";

function getToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

async function requestJson(path, options = {}) {
  const token = getToken();
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

export async function registerWithEmail(payload) {
  const session = await requestJson("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  setToken(session.token);
  return { user: { uid: session.profile.id, email: session.profile.email }, profile: session.profile };
}

export async function loginWithEmail(payload) {
  const session = await requestJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  setToken(session.token);
  return { user: { uid: session.profile.id, email: session.profile.email }, profile: session.profile };
}

export async function logoutCurrentUser() {
  setToken(null);
}

export function subscribeToAuthChange(callback) {
  let active = true;

  async function hydrateSession() {
    const token = getToken();

    if (!token) {
      callback(null);
      return;
    }

    try {
      const payload = await requestJson("/api/auth/me");

      if (!active) {
        return;
      }

      callback({
        user: { uid: payload.profile.id, email: payload.profile.email },
        profile: payload.profile,
      });
    } catch {
      setToken(null);
      if (active) {
        callback(null);
      }
    }
  }

  hydrateSession();

  const handleStorage = (event) => {
    if (event.key === TOKEN_KEY) {
      hydrateSession();
    }
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    active = false;
    window.removeEventListener("storage", handleStorage);
  };
}

export function getAccessToken() {
  return getToken();
}
