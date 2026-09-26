import { createContext, useContext, useState, useEffect } from 'react';
import { login as loginService, register as registerService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage on mount
    const storedUser = localStorage.getItem('truthguard_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Backfill role for existing sessions that predate Phase 6
        if (!parsedUser.role) {
          parsedUser.role = 'user';
          localStorage.setItem('truthguard_user', JSON.stringify(parsedUser));
        }
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('truthguard_user');
        localStorage.removeItem('truthguard_token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await loginService(email, password);
    const userObj = response.user;
    setUser(userObj);
    localStorage.setItem('truthguard_user', JSON.stringify(userObj));
    return userObj;
  };

  const register = async (name, email, password) => {
    const response = await registerService(name, email, password);
    const userObj = response.user;
    setUser(userObj);
    localStorage.setItem('truthguard_user', JSON.stringify(userObj));
    return userObj;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('truthguard_user');
    localStorage.removeItem('truthguard_token');
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
