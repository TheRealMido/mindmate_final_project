import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

const LanguageToggle = () => {
  const { lang, toggleLang } = useI18n();

  return (
    <button
      onClick={toggleLang}
      className="relative flex items-center w-16 h-8 rounded-full bg-muted border border-border overflow-hidden transition-colors hover:bg-secondary"
      aria-label="Toggle language"
    >
      <motion.div
        className="absolute w-7 h-6 rounded-full bg-primary shadow-sm"
        animate={{ x: lang === "en" ? 3 : 33 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
      <span className={`relative z-10 flex-1 text-center text-xs font-bold ${lang === "en" ? "text-primary-foreground" : "text-muted-foreground"}`}>
        EN
      </span>
      <span className={`relative z-10 flex-1 text-center text-xs font-bold ${lang === "ar" ? "text-primary-foreground" : "text-muted-foreground"}`}>
        عر
      </span>
    </button>
  );
};

export default LanguageToggle;
