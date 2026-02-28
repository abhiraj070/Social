"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { authApi } from "@/lib/api";

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string;
  coverImage?: string;
  watchHistory?: string[];
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  /** Re-fetch the current user from the server */
  refreshUser: () => Promise<void>;
  /** Clear local state (called after logout API succeeds) */
  clearUser: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  clearUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await authApi.getCurrentUser();
      setUser(data as User);
      // keep localStorage in sync for components that still read it
      if (data) {
        localStorage.setItem("fullName", (data as User).fullName);
        localStorage.setItem("username", (data as User).username);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem("fullName");
    localStorage.removeItem("username");
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
