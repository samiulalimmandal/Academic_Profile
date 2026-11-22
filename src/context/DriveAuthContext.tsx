import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  clearCachedToken,
  getAccessToken,
  googleSignIn,
  initAuth,
  logout,
} from '../services/googleAuth';

interface DriveAuthContextValue {
  user: User | null;
  accessToken: string | null;
  needsAuth: boolean;
  isLoggingIn: boolean;
  authError: string | null;
  signIn: () => Promise<string | null>;
  signOut: () => Promise<void>;
  invalidateToken: () => void;
}

const DriveAuthContext = createContext<DriveAuthContextValue | null>(null);

export const DriveAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (signedInUser, token) => {
        setUser(signedInUser);
        setAccessToken(token);
        setNeedsAuth(false);
        setAuthError(null);
      },
      () => {
        setAccessToken(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const signIn = async (): Promise<string | null> => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        setNeedsAuth(false);
        return result.accessToken;
      }
      return null;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Unable to complete Google sign-in.';
      setAuthError(msg);
      return null;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const signOut = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setNeedsAuth(true);
    setAuthError(null);
  };

  const invalidateToken = () => {
    clearCachedToken();
    setAccessToken(null);
    setNeedsAuth(true);
  };

  useEffect(() => {
    getAccessToken().then((t) => {
      if (t) {
        setAccessToken(t);
        setNeedsAuth(false);
      }
    });
  }, []);

  return (
    <DriveAuthContext.Provider
      value={{
        user,
        accessToken,
        needsAuth,
        isLoggingIn,
        authError,
        signIn,
        signOut,
        invalidateToken,
      }}
    >
      {children}
    </DriveAuthContext.Provider>
  );
};

export function useDriveAuth(): DriveAuthContextValue {
  const ctx = useContext(DriveAuthContext);
  if (!ctx) {
    throw new Error('useDriveAuth must be used inside DriveAuthProvider');
  }
  return ctx;
}
