import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index.tsx";
import CompanionPage from "./pages/CompanionPage.tsx";
import Auth from "./pages/Auth.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, requireOnboarding = true }: { children: JSX.Element; requireOnboarding?: boolean }) => {
  const [status, setStatus] = useState<"loading" | "in" | "out" | "needs_onboarding">("loading");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus("out");
        return;
      }
      
      const hasOnboarded = session.user.user_metadata?.onboarding_completed;
      if (requireOnboarding && !hasOnboarded) {
        setStatus("needs_onboarding");
      } else {
        setStatus("in");
      }
    };
    
    checkSession();
    
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
       checkSession();
    });
    return () => sub.subscription.unsubscribe();
  }, [requireOnboarding]);

  if (status === "loading") return <div className="h-screen w-full bg-background" />;
  if (status === "out") return <Navigate to="/auth" replace />;
  if (status === "needs_onboarding") return <Navigate to="/onboarding" replace />;
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<ProtectedRoute requireOnboarding={false}><Onboarding /></ProtectedRoute>} />
          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
          <Route path="/companion" element={<ProtectedRoute><CompanionPage /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
