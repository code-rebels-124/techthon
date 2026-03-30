import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginWithEmail, logoutCurrentUser, registerWithEmail, subscribeToAuthChange } from "../services/firebase";
import { getHomeRoute } from "../utils/role-routes";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  function applySession(session) {
    setCurrentUser(session?.user ?? null);
    setProfile(session?.profile ?? null);
  }

  useEffect(() => {
    const unsubscribe = subscribeToAuthChange((session) => {
      applySession(session);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function login(credentials) {
    const session = await loginWithEmail(credentials);
    applySession(session);
    return session;
  }

  async function register(payload) {
    const session = await registerWithEmail(payload);
    applySession(session);
    return session;
  }

  async function logout() {
    await logoutCurrentUser();
    applySession(null);
  }

  const value = useMemo(
    () => ({
      currentUser,
      profile,
      role: profile?.role ?? null,
      loading,
      homeRoute: getHomeRoute(profile?.role ?? "requester"),
      login,
      register,
      logout,
    }),
    [currentUser, loading, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
