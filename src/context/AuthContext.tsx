import React, { createContext, useEffect, useState, useContext } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

interface UserContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
}

const AuthContext = createContext<UserContextType>({
  user: null,
  role: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async (userId: string) => {
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id_user", userId)
        .single();

      if (!error && data) {
        setRole(data.role);
      } else {
        setRole(null);
      }
    };

    const getUser = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        await fetchUserRole(session.user.id);
      } else {
        setRole(null);
      }
      setLoading(false);
    };

    getUser();

    // listen auth state
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user || null);
        if (session?.user) {
          await fetchUserRole(session.user.id);
        } else {
          setRole(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
