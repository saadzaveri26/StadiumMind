import { useEffect, useState } from "react";
import { User, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export interface AuthState {
  user: User | null;
  loading: boolean;
  isStaff: boolean;
}

/**
 * React hook that manages the current authentication state and provides login/logout actions.
 * Listens to onAuthStateChanged and decodes token claims for custom 'staff' claim.
 * @returns The user state, loading flag, isStaff flag, signInWithGoogle function, and logout function.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isStaff, setIsStaff] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idTokenResult = await currentUser.getIdTokenResult();
          setIsStaff(!!idTokenResult.claims.staff);
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

  /**
   * Triggers the Google OAuth popup sign-in.
   * @returns A promise resolving to the user credential.
   */
  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs out the current user session.
   * @returns A promise that resolves when sign-out is complete.
   */
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, isStaff, signInWithGoogle, logout };
}
