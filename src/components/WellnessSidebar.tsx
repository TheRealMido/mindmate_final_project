import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Smile, Frown, Meh, Sun, Moon, Zap, Leaf } from "lucide-react";
import { toast } from "sonner";
import BreathingExercise from "./BreathingExercise";
import { useI18n } from "@/lib/i18n";
import { useCompanion } from "@/lib/companion";

const WellnessSidebar = () => {
  const { t, dir } = useI18n();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moodOptions = [
    { icon: Smile, label: t.moodGreat, color: "text-sunrise-light", bg: "bg-sunrise-light/10" },
    { icon: Sun, label: t.moodGood, color: "text-sunrise-bright", bg: "bg-sunrise-bright/10" },
    { icon: Meh, label: t.moodOkay, color: "text-muted-foreground", bg: "bg-muted" },
    { icon: Frown, label: t.moodLow, color: "text-sunrise-mid", bg: "bg-sunrise-mid/10" },
  ];

  const tips = [
    { icon: Leaf, text: t.tipBreathe },
    { icon: Heart, text: t.tipGratitude },
    { icon: Zap, text: t.tipStretch },
    { icon: Moon, text: t.tipWrite },
  ];

  const { companion, recordMoodCheckin } = useCompanion();

  const handleMoodSelect = (label: string) => {
    setSelectedMood(label);
    recordMoodCheckin(label);
    toast.success(t.moodTracked);
    setTimeout(() => setSelectedMood(null), 2000);
  };

  return (
    <div className="h-full flex flex-col gap-6 p-6 bg-card border-s border-border overflow-y-auto" dir={dir}>
      {/* Mood Tracker */}
      <motion.div
        initial={{ opacity: 0, x: dir === "rtl" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="font-heading font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
          {t.howFeeling}
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {moodOptions.map((mood) => (
            <motion.button
              key={mood.label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMoodSelect(mood.label)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200 ${
                selectedMood === mood.label
                  ? `${mood.bg} ring-2 ring-sunrise-bright`
                  : "bg-muted hover:bg-secondary"
              } group`}
            >
              <AnimatePresence mode="wait">
                {selectedMood === mood.label ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    className="text-sunrise-bright text-lg"
                  >
                    ✓
                  </motion.div>
                ) : (
                  <motion.div key="icon" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                    <mood.icon className={`w-6 h-6 ${mood.color} group-hover:scale-110 transition-transform`} />
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-xs font-medium text-muted-foreground">{mood.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Breathing Exercise */}
      <motion.div
        initial={{ opacity: 0, x: dir === "rtl" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-heading font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
          {t.breathe}
        </h3>
        <BreathingExercise />
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, x: dir === "rtl" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="font-heading font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">
          {t.wellnessTips}
        </h3>
        <div className="flex flex-col gap-3">
          {tips.map((tip, i) => (
            <motion.div
              key={i}
              whileHover={{ x: dir === "rtl" ? -4 : 4 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border cursor-default"
            >
              <tip.icon className="w-4 h-4 mt-0.5 text-sunrise-bright flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, x: dir === "rtl" ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-auto p-4 rounded-xl bg-sunrise-deep text-primary-foreground"
      >
        <p className="text-xs font-medium opacity-90">{t.disclaimer}</p>
      </motion.div>
    </div>
  );
};

export default WellnessSidebar;
