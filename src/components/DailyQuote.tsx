import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const quotes = {
  en: [
    { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
    { text: "The only way out is through. Keep going.", author: "Robert Frost" },
    { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
    { text: "Happiness can be found even in the darkest of times, if one only remembers to turn on the light.", author: "Albus Dumbledore" },
    { text: "Be gentle with yourself. You're doing the best you can.", author: "Unknown" },
    { text: "Every day may not be good, but there is something good in every day.", author: "Alice Morse Earle" },
    { text: "Your mental health is a priority. Your happiness is essential. Your self-care is a necessity.", author: "Unknown" },
    { text: "It's okay to take a break. You can't pour from an empty cup.", author: "Unknown" },
    { text: "The sun will rise and we will try again.", author: "Unknown" },
    { text: "You are not your illness. You have a name, a history, a personality. Staying yourself is part of the battle.", author: "Julian Seifter" },
    { text: "Storms don't last forever. Hold on.", author: "Unknown" },
    { text: "Small steps every day lead to big changes over time.", author: "Unknown" },
    { text: "Breathe. You're going to be okay. You've survived every bad day so far.", author: "Unknown" },
    { text: "You are worthy of love, especially from yourself.", author: "Unknown" },
  ],
  ar: [
    { text: "أنت أشجع مما تعتقد، وأقوى مما تبدو، وأذكى مما تظن.", author: "أ.أ. ميلن" },
    { text: "الطريقة الوحيدة للخروج هي المرور من خلالها. استمر.", author: "روبرت فروست" },
    { text: "لا يجب أن تتحكم بأفكارك، فقط توقف عن السماح لها بالتحكم بك.", author: "دان ميلمان" },
    { text: "يمكن إيجاد السعادة حتى في أحلك الأوقات، إذا تذكر المرء أن يشعل النور.", author: "ألباس دمبلدور" },
    { text: "كن لطيفاً مع نفسك. أنت تبذل أفضل ما لديك.", author: "مجهول" },
    { text: "قد لا يكون كل يوم جيداً، لكن في كل يوم شيء جيد.", author: "أليس مورس إيرل" },
    { text: "صحتك النفسية أولوية. سعادتك ضرورية. عنايتك بنفسك حاجة أساسية.", author: "مجهول" },
    { text: "لا بأس أن تأخذ استراحة. لا يمكنك أن تعطي من كوب فارغ.", author: "مجهول" },
    { text: "ستشرق الشمس وسنحاول مجدداً.", author: "مجهول" },
    { text: "أنت لست مرضك. لديك اسم وتاريخ وشخصية. الحفاظ على ذاتك جزء من المعركة.", author: "جوليان سايفتر" },
    { text: "العواصف لا تدوم للأبد. تمسك.", author: "مجهول" },
    { text: "خطوات صغيرة كل يوم تؤدي إلى تغييرات كبيرة مع الوقت.", author: "مجهول" },
    { text: "تنفس. ستكون بخير. لقد نجوت من كل يوم صعب حتى الآن.", author: "مجهول" },
    { text: "أنت تستحق الحب، خاصة من نفسك.", author: "مجهول" },
  ],
};

const DailyQuote = () => {
  const { lang, dir } = useI18n();

  const quote = useMemo(() => {
    // Use the day of year as a stable seed so it changes daily
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    const list = quotes[lang];
    return list[dayOfYear % list.length];
  }, [lang]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      dir={dir}
      className="w-full max-w-md"
    >
      <div className="relative rounded-2xl border border-sunrise-bright/20 bg-sunrise-bright/5 px-5 py-4 overflow-hidden">
        {/* Decorative glow */}
        <div className="absolute -top-6 -end-6 w-20 h-20 rounded-full bg-sunrise-bright/10 blur-2xl" />

        <div className="flex items-start gap-3 relative">
          <div className="w-8 h-8 rounded-lg bg-sunrise-bright/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-sunrise-bright" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-sunrise-bright font-semibold mb-1.5">
              {lang === "ar" ? "إلهام اليوم" : "Daily Inspiration"}
            </p>
            <p className="text-sm text-foreground leading-relaxed italic">"{quote.text}"</p>
            <p className="text-xs text-muted-foreground mt-1.5">— {quote.author}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyQuote;
