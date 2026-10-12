import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import authService from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  /**
   * Verify whether the browser has an active valid session cookie
   */
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await authService.getCurrentUser();
      if (data && data.success && data.user) {
        setUser(data.user);
        setAuthError(null);
        return data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (err) {
      // 401 is normal when visitor is simply not logged in
      setUser(null);
      if (err.status !== 401) {
        setAuthError(err.message || "Failed to verify session");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await authService.getCurrentUser();
        if (isMounted) {
          if (data && data.success && data.user) {
            setUser(data.user);
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log in user with credentials and store profile in state
   */
  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    if (data && data.user) {
      setUser(data.user);
    }
    return data;
  }, []);

  /**
   * Log out user, invoke backend cookie clearance, and reset state
   */
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if network or backend fails, reset local auth state
    } finally {
      setUser(null);
    }
  }, []);

  /**
   * Update current user in local state (e.g. after address modification or profile update)
   */
  const updateUser = useCallback((updater) => {
    setUser((prev) => {
      if (typeof updater === "function") {
        return updater(prev);
      }
      return { ...prev, ...updater };
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      authError,
      login,
      logout,
      checkAuth,
      updateUser,
      setUser,
    }),
    [user, isLoading, authError, login, logout, checkAuth, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
