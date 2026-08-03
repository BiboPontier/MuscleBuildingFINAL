import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile, UserRole } from '@/types';
import { getCurrentProfile, loginUser, logoutUser, registerUser } from '@/lib/db';

interface AuthContextValue {
  profile: Profile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { full_name: string; email: string; password: string; role: UserRole }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentProfile()
      .then(setProfile)
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const p = await loginUser(email, password);
    const fresh = await getCurrentProfile();
    setProfile(fresh ?? (p as unknown as Profile));
  }

  async function register(input: { full_name: string; email: string; password: string; role: UserRole }) {
    await registerUser(input);
    const fresh = await getCurrentProfile();
    setProfile(fresh);
  }

  async function logout() {
    await logoutUser();
    setProfile(null);
  }

  return <AuthContext.Provider value={{ profile, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
