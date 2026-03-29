"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api } from "@/lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "attendee" | "organizer" | "admin";
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    loading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("eventpulse_auth");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState({ user: parsed.user, accessToken: parsed.accessToken, loading: false });
      } catch {
        setState((s) => ({ ...s, loading: false }));
      }
    } else {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  const persist = (user: User, accessToken: string, refreshToken: string) => {
    localStorage.setItem("eventpulse_auth", JSON.stringify({ user, accessToken }));
    localStorage.setItem("eventpulse_refresh", refreshToken);
    setState({ user, accessToken, loading: false });
  };

  const login = async (email: string, password: string) => {
    const data = await api<{ user: User; accessToken: string; refreshToken: string }>(
      "/api/auth/login",
      { method: "POST", body: { email, password } }
    );
    persist(data.user, data.accessToken, data.refreshToken);
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    const data = await api<{ user: User; accessToken: string; refreshToken: string }>(
      "/api/auth/register",
      { method: "POST", body: { email, password, name, role } }
    );
    persist(data.user, data.accessToken, data.refreshToken);
  };

  const logout = () => {
    localStorage.removeItem("eventpulse_auth");
    localStorage.removeItem("eventpulse_refresh");
    setState({ user: null, accessToken: null, loading: false });
  };

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("eventpulse_refresh");
    if (!refreshToken) return null;
    try {
      const data = await api<{ accessToken: string }>("/api/auth/refresh", {
        method: "POST",
        body: { refreshToken },
      });
      const stored = localStorage.getItem("eventpulse_auth");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.accessToken = data.accessToken;
        localStorage.setItem("eventpulse_auth", JSON.stringify(parsed));
      }
      setState((s) => ({ ...s, accessToken: data.accessToken }));
      return data.accessToken;
    } catch {
      logout();
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
