import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AuthService, type CurrentUser } from '../services/auth.service';

interface AuthContextValue {
  user: CurrentUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = AuthService.getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const currentUser = await AuthService.me();
      setUser(currentUser);
    } catch {
      AuthService.clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshMe();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, [refreshMe]);

  const login = useCallback(async (username: string, password: string) => {
    const result = await AuthService.login({ username, password });
    AuthService.saveToken(result.access_token);
    const currentUser = await AuthService.me();
    setUser(currentUser);
  }, []);

  const logout = useCallback(() => {
    AuthService.clearToken();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshMe,
    }),
    [user, loading, login, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}