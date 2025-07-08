"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { isLoggedIn, getAuthToken } from '@/services/auth';

interface User {
  userId: number;
  userName: string;
  nickName: string;
  avatar: string;
  roles: string[];
  menus: any[];
  buttons: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  token: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      if (isLoggedIn()) {
        const userInfoStr = localStorage.getItem('userInfo');
        if (userInfoStr) {
          setUser(JSON.parse(userInfoStr));
        }
        setToken(getAuthToken());
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 