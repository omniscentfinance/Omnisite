import { createContext, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minuti
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);
  const userRef = useRef(null);

  const fetchProfile = async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    setProfile(data);
  };

  const resetTimer = () => {
    if (!userRef.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      supabase.auth.signOut();
    }, INACTIVITY_TIMEOUT);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      userRef.current = session?.user ?? null;
      if (session?.user) fetchProfile(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      userRef.current = session?.user ?? null;
      if (session?.user) {
        fetchProfile(session.user.id);
        resetTimer();
      } else {
        setProfile(null);
        clearTimeout(timerRef.current);
      }
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    return () => {
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, resetTimer));
      clearTimeout(timerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signUp = async (email, password, fullName) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { error };
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshProfile = () => {
    if (user) fetchProfile(user.id);
  };

  const isPlanActive = () => {
    if (!profile?.plan) return false;
    // Nessuna scadenza = piano lifetime (es. Advanced)
    if (!profile.plan_expires_at) return true;
    return new Date(profile.plan_expires_at) > new Date();
  };

  // True solo per chi ha il piano Master Mentor attivo (accesso al calendario 1to1)
  const isMentorshipActive = () => isPlanActive() && profile?.plan === "mentorship";

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile, isPlanActive, isMentorshipActive }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
