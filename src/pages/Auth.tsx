import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { I18nProvider, useI18n } from "@/lib/i18n";
import WaterEffect from "@/components/WaterEffect";
import LanguageToggle from "@/components/LanguageToggle";

const AuthInner = () => {
  const navigate = useNavigate();
  const { dir } = useI18n();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If already signed in, redirect home
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/", { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success(dir === "rtl" ? "تم إنشاء الحساب" : "Account created");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isAr = dir === "rtl";

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4" dir={dir}>
      <WaterEffect />
      <div className="absolute top-4 end-4 z-20">
        <LanguageToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl"
      >
        <div className="text-center mb-6">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">MindMate</h1>
          <p className="text-sm text-muted-foreground">
            {isAr
              ? mode === "signin" ? "أهلاً بعودتك — سجل الدخول لاستكمال محادثاتك" : "أنشئ حسابك لحفظ محادثاتك"
              : mode === "signin" ? "Welcome back — sign in to continue your chats" : "Create an account to save your chats"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{isAr ? "البريد الإلكتروني" : "Email"}</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{isAr ? "كلمة المرور" : "Password"}</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full rounded-xl">
            {loading
              ? (isAr ? "..." : "...")
              : mode === "signin"
              ? (isAr ? "تسجيل الدخول" : "Sign in")
              : (isAr ? "إنشاء حساب" : "Sign up")}
          </Button>
        </form>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {mode === "signin"
            ? (isAr ? "ليس لديك حساب؟ أنشئ واحداً" : "No account? Create one")
            : (isAr ? "لديك حساب بالفعل؟ سجل الدخول" : "Already have an account? Sign in")}
        </button>
      </motion.div>
    </div>
  );
};

const Auth = () => (
  <I18nProvider>
    <AuthInner />
  </I18nProvider>
);

export default Auth;
