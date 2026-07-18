"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, signInWithPopup, signOut, getIdTokenResult } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  isStaff: boolean;
  signInWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStaff, setIsStaff] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const tokenResult = await getIdTokenResult(currentUser, true);
          setIsStaff(!!tokenResult.claims.staff);
        } catch {
          setIsStaff(false);
        }
      } else {
        setIsStaff(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setIsStaff(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isStaff, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
