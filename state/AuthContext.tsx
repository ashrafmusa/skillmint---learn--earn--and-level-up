
import React, { createContext, useState, useContext, useEffect, ReactNode, useMemo } from 'react';
import { User } from '../types';

const AUTH_STORAGE_KEY = 'skillmint_user';

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

interface AuthContextType extends AuthState {
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getInitialState = (): AuthState => {
  try {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      const user = JSON.parse(storedUser);
      return { isAuthenticated: true, user };
    }
  } catch (error) {
    console.error("Failed to load user from localStorage", error);
  }
  return { isAuthenticated: false, user: null };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>(getInitialState);

  const login = (name: string) => {
    // In a real app, this would involve an API call.
    // Here, we'll just create a user object.
    const user: User = { id: name.toLowerCase().replace(/\s/g, '_'), name };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    setState({ isAuthenticated: true, user });
    // NO reload. AppContext will listen for user change and reset state.
  };

  const logout = () => {
    const userToLogout = state.user;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Also clear the user's progress data
    if (userToLogout) {
        localStorage.removeItem(`skillmint_progress_${userToLogout.id}`);
    }
    setState({ isAuthenticated: false, user: null });
    // NO reload. AppContext will handle the state reset.
  };

  const value = useMemo(() => ({
    ...state,
    login,
    logout,
  }), [state]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
