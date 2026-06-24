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

  const isAdmin = () => !!profile?.is_admin;

  // Advanced è lifetime: una volta acquistato resta sempre. Gli admin hanno tutto.
  const hasAdvanced = () => !!profile && (profile.has_advanced === true || isAdmin());

  // Mentorship è a tempo (3 mesi). Gli admin hanno tutto.
  const isMentorshipActive = () => {
    if (!profile) return false;
    if (isAdmin()) return true;
    return !!profile.mentorship_expires_at && new Date(profile.mentorship_expires_at) > new Date();
  };

  // Piano "effettivo" calcolato dalle entitlement. Master + = advanced + mentorship insieme.
  const effectivePlan = () => {
    if (isAdmin()) return "master_plus";
    const adv = profile?.has_advanced === true;
    const ment = !!profile?.mentorship_expires_at && new Date(profile.mentorship_expires_at) > new Date();
    if (adv && ment) return "master_plus";
    if (ment) return "mentorship";
    if (adv) return "advanced";
    return "free";
  };

  // Retrocompat: "piano attivo" = ha almeno l'accesso ai servizi advanced.
  const isPlanActive = () => hasAdvanced();

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile, isPlanActive, hasAdvanced, isMentorshipActive, isAdmin, effectivePlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
