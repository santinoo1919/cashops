import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DrawerSession } from '../types';

interface SessionsState {
  sessions: DrawerSession[];
  isLoading: boolean;
  addSession: (session: DrawerSession) => void;
  updateSession: (id: string, updates: Partial<DrawerSession>) => void;
  deleteSession: (id: string) => void;
  clearAllSessions: () => void;
}

// Helper to serialize dates for storage (Date -> ISO string)
function serializeSession(session: DrawerSession): any {
  return {
    ...session,
    date: session.date instanceof Date ? session.date.toISOString() : session.date,
    transactions: session.transactions.map((t) => ({
      ...t,
      timestamp: t.timestamp instanceof Date ? t.timestamp.toISOString() : t.timestamp,
    })),
  };
}

// Helper to ensure a value is a Date object
function ensureDate(value: any): Date {
  if (value instanceof Date) {
    return value;
  }
  if (typeof value === 'string' || typeof value === 'number') {
    return new Date(value);
  }
  // Fallback to current date if invalid
  console.warn('Invalid date value, using current date:', value);
  return new Date();
}

// Helper to deserialize dates from storage (ISO string -> Date)
function deserializeSession(data: any): DrawerSession {
  if (!data) {
    throw new Error('Invalid session data');
  }
  
  return {
    ...data,
    date: ensureDate(data.date),
    transactions: (data.transactions || []).map((t: any) => ({
      ...t,
      timestamp: ensureDate(t.timestamp),
    })),
  };
}

export const useSessionsStore = create<SessionsState>()(
  persist(
    (set) => ({
      sessions: [],
      isLoading: false,

      addSession: (session) => {
        set((state) => ({
          sessions: [session, ...state.sessions],
        }));
      },

      updateSession: (id, updates) => {
        set((state) => ({
          sessions: state.sessions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteSession: (id) => {
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id),
        }));
      },

      clearAllSessions: () => {
        set({ sessions: [] });
      },
    }),
    {
      name: 'sessions-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Custom serialization for Date objects
      serialize: (state) => {
        const serializedSessions = state.state.sessions.map(serializeSession);
        return JSON.stringify({
          state: {
            ...state.state,
            sessions: serializedSessions,
          },
          version: state.version,
        });
      },
      // Custom deserialization for Date objects
      deserialize: (str) => {
        try {
          const parsed = JSON.parse(str);
          // Handle case where sessions might not exist yet
          const sessions = parsed.state?.sessions || [];
          const deserializedSessions = sessions.map(deserializeSession);
          return {
            state: {
              ...parsed.state,
              sessions: deserializedSessions,
            },
            version: parsed.version || 0,
          };
        } catch (error) {
          console.error('Error deserializing sessions:', error);
          // Return empty state on error
          return {
            state: {
              sessions: [],
              isLoading: false,
            },
            version: 0,
          };
        }
      },
    }
  )
);

// Selector to get sessions with guaranteed Date objects
// Use this to ensure dates are always Date objects, even if deserialize didn't run
export const useSessions = () => {
  const store = useSessionsStore();
  
  // Normalize dates on read as a safety net
  const normalizedSessions = store.sessions.map((session) => ({
    ...session,
    date: ensureDate(session.date),
    transactions: session.transactions.map((t) => ({
      ...t,
      timestamp: ensureDate(t.timestamp),
    })),
  }));
  
  return {
    ...store,
    sessions: normalizedSessions,
  };
};

