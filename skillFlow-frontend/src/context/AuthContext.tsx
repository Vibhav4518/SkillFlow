"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  getAccessToken,
  setAccessToken as setToken,
  subscribeToken,
  refreshAccessToken,
  apiFetch,
} from "@/lib/api";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  profilePhotoUrl?: string | null;
  avatarUrl?: string | null;
}

interface AuthContextValue {
  accessToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (accessToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(
    getAccessToken()
  );
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Keep state in sync with module-level token (api.ts can update it)
  useEffect(() => {
    return subscribeToken(setAccessTokenState);
  }, []);

  // On mount: load current user via /auth/me or attempt silent refresh
  useEffect(() => {
    let cancelled = false;

    (async () => {
      let token = getAccessToken();
      if (!token) {
        token = await refreshAccessToken();
      }

      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const json = await apiFetch("/auth/me", { skipRefreshRetry: true });
        const userData = json?.data || json?.user;
        if (userData && !cancelled) {
          setUser(userData);
        } else if (!json?.success) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            const json2 = await apiFetch("/auth/me", { skipRefreshRetry: true });
            const userData2 = json2?.data || json2?.user;
            if (userData2 && !cancelled) {
              setUser(userData2);
            }
          } else {
            setToken(null);
            setUser(null);
          }
        }
      } catch {
        // Silently fail — user is logged out
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((token: string, u: AuthUser) => {
    setToken(token);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((partial: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        user,
        isLoading,
        isAuthenticated: !!accessToken,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an <AuthProvider>");
  return ctx;
}
