import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { ServiceResponse } from '@/types';
import { mapProfileFromDB } from '@/services/profile-mapper';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: any | null;
  signIn: (email: string, password: string) => Promise<ServiceResponse<{ user: User; session: Session }>>;
  signUp: (email: string, password: string) => Promise<ServiceResponse<{ user: User | null; session: Session | null }>>;
  signOut: () => Promise<ServiceResponse<void>>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Mapped via shared utility

  const refreshProfile = async () => {
    if (!isSupabaseConfigured || !user) return;
    if (user) {
      const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(mapProfileFromDB(userProfile));
    }
  };

  useEffect(() => {
    const getInitialSession = async () => {
      if (!isSupabaseConfigured) {
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        return;
      }
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
          setProfile(mapProfileFromDB(userProfile));
        }
      } catch (error) {
        logger.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    if (!isSupabaseConfigured) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        if (currentUser) {
          const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
          const mappedProfile = mapProfileFromDB(userProfile);
          setProfile(mappedProfile);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<ServiceResponse<{ user: User; session: Session }>> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', success: false };
    }
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error, success: false };
      return { data: { user: data.user!, session: data.session! }, success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign in failed', success: false };
    }
  };

  const signUp = async (email: string, password: string): Promise<ServiceResponse<{ user: User | null; session: Session | null }>> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', success: false };
    }
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) return { error, success: false };
      return { data: { user: data.user, session: data.session }, success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign up failed', success: false };
    }
  };

  const signOut = async (): Promise<ServiceResponse<void>> => {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.', success: false };
    }
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return { error, success: false };
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign out failed', success: false };
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, profile, signIn, signUp, signOut, refreshProfile }}>
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