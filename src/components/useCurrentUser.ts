import { useEffect, useState } from "react";

export type AppUser = {
  id: string;
  name: string;
  isAdmin: boolean;
};

const STORAGE_KEY = "currentUser";

export default function useCurrentUser() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const rawUser = localStorage.getItem(STORAGE_KEY);

    if (!rawUser) {
      setLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(rawUser) as AppUser;
      setUser(parsedUser);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData: AppUser) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  return { user, loading, login, logout };
}