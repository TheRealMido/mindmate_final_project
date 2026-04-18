import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useI18n, I18nProvider } from "@/lib/i18n";
import WaterEffect from "@/components/WaterEffect";
import LanguageToggle from "@/components/LanguageToggle";

const QUESTIONS = [
  {
    id: "focus",
    en: "What brings you to MindMate?",
    ar: "ما الذي أتى بك إلى مايند ميت؟",
    options: [
      { id: "anxiety", en: "Managing Anxiety", ar: "التعامل مع القلق" },
      { id: "stress", en: "Work/Life Stress", ar: "ضغوط العمل/الحياة" },
      { id: "loneliness", en: "Feeling Lonely", ar: "الشعور بالوحدة" },
      { id: "growth", en: "Personal Growth", ar: "النمو الشخصي" },
      { id: "vent", en: "Just need to talk", ar: "أحتاج للفضفضة فقط" },
    ],
  },
  {
    id: "style",
    en: "How would you like me to interact with you?",
    ar: "كيف تفضل أن أتواصل معك؟",
    options: [
      { id: "gentle", en: "Gentle & Comforting", ar: "لطيف ومريح" },
      { id: "direct", en: "Direct & Actionable", ar: "مباشر وعملي" },
      { id: "casual", en: "Casual & Friendly", ar: "ودي وغير رسمي" },
    ],
  },
];

const OnboardingInner = () => {
  const navigate = useNavigate();
  const { lang, dir } = useI18n();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [triggerInput, setTriggerInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setTimeout(() => {
      if (step < QUESTIONS.length) {
        setStep(step + 1);
      }
    }, 400); // Small delay for visual feedback
  };

  const finishOnboarding = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not logged in");

      const finalAnswers = {
        ...answers,
        triggers: triggerInput.trim(),
      };

      const { error } = await supabase.auth.updateUser({
        data: {
          onboarding_completed: true,
          preferences: finalAnswers,
        },
      });

      if (error) throw error;
      
      toast.success(lang === "ar" ? "تم حفظ إعداداتك بنجاح!" : "Preferences saved beautifully!");
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(lang === "ar" ? "حدث خطأ أثناء حفظ الإعدادات" : "Failed to save preferences");
      setIsSubmitting(false);
    }
  };

  const isAr = lang === "ar";
  const currentQ = QUESTIONS[step];

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background px-4 overflow-hidden" dir={dir}>
      <WaterEffect />
      <div className="absolute top-4 end-4 z-20">
        <LanguageToggle />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-lg bg-card/80 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl overflow-hidden min-h-[400px] flex flex-col"
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-xl font-bold text-foreground">
            {isAr ? "لنتعرف عليك أكثر" : "Let's personalize your AI"}
          </h1>
          <span className="text-sm font-medium text-muted-foreground">
            {step + 1} / {QUESTIONS.length + 1}
          </span>
        </div>

        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {step < QUESTIONS.length ? (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: isAr ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? 30 : -30 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <h2 className="text-2xl font-semibold mb-6 text-foreground drop-shadow-sm">
                  {isAr ? currentQ.ar : currentQ.en}
                </h2>
                <div className="flex flex-col gap-3">
                  {currentQ.options.map((opt) => {
                    const isSelected = answers[currentQ.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => handleSelect(currentQ.id, opt.id)}
                        className={`text-start px-5 py-4 rounded-2xl border transition-all duration-300 ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-lg scale-[1.02]"
                            : "bg-background/50 border-border text-foreground hover:bg-secondary hover:border-primary/50"
                        }`}
                      >
                        <span className="text-sm font-body font-medium">{isAr ? opt.ar : opt.en}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="final"
                initial={{ opacity: 0, x: isAr ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isAr ? 30 : -30 }}
                className="absolute inset-0 flex flex-col"
              >
                <h2 className="text-2xl font-semibold mb-4 text-foreground drop-shadow-sm">
                  {isAr ? "أي مواضيع تفضل تجنبها؟" : "Any specific topics to avoid?"}
                </h2>
                <p className="text-sm text-muted-foreground mb-6">
                  {isAr
                    ? "(اختياري) هل هناك أي شيء يزعجك ويجب أن يتجنبه مساعدك الذكي؟"
                    : "(Optional) Is there anything triggering you'd like your AI companion to stay away from?"}
                </p>
                
                <textarea
                  value={triggerInput}
                  onChange={(e) => setTriggerInput(e.target.value)}
                  placeholder={isAr ? "اكتب هنا..." : "Type here..."}
                  className="w-full h-32 px-4 py-3 rounded-2xl bg-background/50 border border-border text-foreground text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none mb-auto"
                />

                <Button
                  onClick={finishOnboarding}
                  disabled={isSubmitting}
                  className="w-full mt-6 rounded-xl py-6 text-md font-semibold"
                >
                  {isSubmitting
                    ? (isAr ? "جاري الحفظ..." : "Saving...")
                    : (isAr ? "البدء الآن" : "Start Chatting")}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

const Onboarding = () => (
  <I18nProvider>
    <OnboardingInner />
  </I18nProvider>
);

export default Onboarding;
