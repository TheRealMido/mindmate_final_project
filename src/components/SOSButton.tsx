import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, X, ExternalLink, ShieldAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const helplines = {
  en: [
    { name: "International Crisis Line", number: "988", description: "Suicide & Crisis Lifeline (US)", url: "https://988lifeline.org" },
    { name: "Crisis Text Line", number: "Text HOME to 741741", description: "Free 24/7 text support (US)", url: "https://www.crisistextline.org" },
    { name: "Befrienders Worldwide", number: "Find local number", description: "International support directory", url: "https://www.befrienders.org" },
    { name: "SAMHSA Helpline", number: "1-800-662-4357", description: "Substance abuse & mental health (US)", url: "https://www.samhsa.gov/find-help/national-helpline" },
  ],
  ar: [
    { name: "خط نجدة الصحة النفسية", number: "920033360", description: "المملكة العربية السعودية", url: "" },
    { name: "خط الدعم النفسي", number: "08008880700", description: "مصر — الخط الساخن", url: "" },
    { name: "Befrienders Worldwide", number: "ابحث عن رقم محلي", description: "دليل الدعم الدولي", url: "https://www.befrienders.org" },
    { name: "خط مساندة", number: "920033360", description: "دعم نفسي على مدار الساعة", url: "" },
  ],
};

const SOSButton = () => {
  const { lang, dir } = useI18n();
  const [open, setOpen] = useState(false);

  const lines = helplines[lang];
  const title = lang === "ar" ? "🚨 دعم نفسي فوري" : "🚨 Immediate Support";
  const subtitle = lang === "ar"
    ? "إذا كنت في خطر أو تحتاج مساعدة فورية، يرجى التواصل مع أحد هذه الخطوط:"
    : "If you're in danger or need immediate help, please reach out to one of these lines:";
  const close = lang === "ar" ? "إغلاق" : "Close";

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive font-semibold text-sm transition-colors group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
      >
        <ShieldAlert className="w-4 h-4 flex-shrink-0" />
        <span className="group-data-[collapsible=icon]:hidden">
          {lang === "ar" ? "طوارئ SOS" : "SOS Emergency"}
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              dir={dir}
            >
              <div className="bg-card border border-border rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
                {/* Header */}
                <div className="bg-destructive/10 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-heading font-bold text-destructive">{title}</h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="w-8 h-8 rounded-full hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4">
                  <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>

                  <div className="space-y-3">
                    {lines.map((line, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: dir === "rtl" ? 10 : -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border"
                      >
                        <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Phone className="w-4 h-4 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{line.name}</p>
                          <p className="text-sm font-bold text-destructive mt-0.5" dir="ltr">
                            {line.number}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{line.description}</p>
                        </div>
                        {line.url && (
                          <a
                            href={line.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-border">
                  <button
                    onClick={() => setOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-muted hover:bg-secondary text-sm font-medium text-foreground transition-colors"
                  >
                    {close}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default SOSButton;
