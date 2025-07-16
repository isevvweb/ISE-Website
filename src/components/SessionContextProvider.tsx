import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";
import { showSuccess, showError } from "@/utils/toast";

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      setIsLoading(false);

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        showSuccess("Successfully signed in!");
        // Redirect authenticated users away from login page if they try to access it
        if (location.pathname === "/login") {
          navigate("/admin");
        }
      } else if (event === 'SIGNED_OUT') {
        showSuccess("Successfully signed out!");
        // Redirect unauthenticated users to login page if they are on an admin route
        if (location.pathname.startsWith("/admin")) {
          navigate("/login");
        }
      } else if (event === 'INITIAL_SESSION') {
        // Handle initial session load
        if (!currentSession && location.pathname.startsWith("/admin")) {
          navigate("/login");
        }
      }
    });

    // Initial check for session
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setUser(initialSession?.user || null);
      setIsLoading(false);
      if (!initialSession && location.pathname.startsWith("/admin")) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  return (
    <SessionContext.Provider value={{ session, user, isLoading }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionContextProvider");
  }
  return context;
};