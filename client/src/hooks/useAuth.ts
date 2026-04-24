/**
 * Axiom Studio — Auth Hook
 * Shared auth state using DWTL SSO tokens.
 */
import { useState, useEffect, useCallback } from "react";

interface AuthUser {
  id: string;
  username: string;
  displayName: string;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<string | null>;
  signup: (username: string, email: string, password: string, displayName: string) => Promise<string | null>;
  logout: () => void;
}

export function useAuth(): AuthState {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("axiom_token") || localStorage.getItem("tl-sso-token");
    const savedUser = localStorage.getItem("axiom_user");
    if (saved) setToken(saved);
    if (savedUser) try { setUser(JSON.parse(savedUser)); } catch {}
  }, []);

  const handleAuthResponse = useCallback((data: any) => {
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("axiom_token", data.token);
      localStorage.setItem("axiom_user", JSON.stringify(data.user));
      return null; // no error
    }
    return data.error || "Authentication failed";
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<string | null> => {
    const res = await fetch("/api/agent/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    return handleAuthResponse(data);
  }, [handleAuthResponse]);

  const signup = useCallback(async (username: string, email: string, password: string, displayName: string): Promise<string | null> => {
    const res = await fetch("/api/agent/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, displayName }),
    });
    const data = await res.json();
    return handleAuthResponse(data);
  }, [handleAuthResponse]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("axiom_token");
    localStorage.removeItem("axiom_user");
  }, []);

  const userId = user?.id || null;

  return { token, userId, user, login, signup, logout };
}
