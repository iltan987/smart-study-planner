'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { getSession } from '@/actions/auth/session.action';
import type { SessionSchema } from '@/schemas/auth/session.schema';
import { logout as logoutAction } from '@/actions/auth/logout.action';

type SessionState =
  | { data: undefined; status: 'loading' }
  | { data: null; status: 'unauthenticated' }
  | { data: SessionSchema; status: 'authenticated' };

type SessionContextType = {
  update: () => Promise<void>;
  logout: () => Promise<void>;
} & SessionState;

const initialContext: SessionContextType = {
  data: undefined,
  status: 'loading',
  update: async () => {},
  logout: async () => {},
};

const SessionContext = createContext<SessionContextType>({
  data: undefined,
  status: 'loading',
  update: async () => {},
  logout: async () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionState>(initialContext);

  const logout = useCallback(async () => {
    await logoutAction();
    setSession({ data: null, status: 'unauthenticated' });
  }, []);

  const refreshSession = useCallback(async () => {
    try {
      setSession({ status: 'loading', data: undefined });

      const res = await getSession();
      if (res.success) {
        setSession({
          data: res.data,
          status: 'authenticated',
        });
      } else {
        setSession({
          data: null,
          status: 'unauthenticated',
        });
      }
    } catch (error) {
      console.error(error);
      setSession({ data: null, status: 'unauthenticated' });
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <SessionContext.Provider
      value={{ ...session, update: refreshSession, logout }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
