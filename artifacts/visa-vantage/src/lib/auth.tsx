import React, { createContext, useContext, useEffect, useState } from "react";
import { useGetMe } from "@workspace/api-client-react";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import type { UserWithProfile } from "@workspace/api-client-react";

interface AuthContextType {
  user: UserWithProfile | null;
  isLoading: boolean;
  token: string | null;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  token: null,
  setToken: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    return localStorage.getItem("visa_vantage_token");
  });

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("visa_vantage_token", newToken);
    } else {
      localStorage.removeItem("visa_vantage_token");
    }
    setTokenState(newToken);
  };

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  const { data: user, isLoading } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
      queryKey: ["getMe", token],
    },
  });

  // If query finishes and we have no user but we have a token, it might be invalid
  useEffect(() => {
    if (!isLoading && token && !user) {
      // Could handle auto-logout here, but let's just let it be null for now
    }
  }, [isLoading, token, user]);

  return (
    <AuthContext.Provider value={{ user: user || null, isLoading, token, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
