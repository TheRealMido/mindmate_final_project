import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wind } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const PHASES = ["in", "hold", "out"] as const;
const DURATIONS = { in: 4, hold: 4, out: 4 };

const BreathingExercise = () => {
  const { t } = useI18n();
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState<(typeof PHASES)[number]>("in");
  const [count, setCount] = useState(4);

  const phaseLabel = {
    in: t.breatheIn,
    hold: t.holdBreath,
    out: t.breatheOut,
  };

  const startExercise = useCallback(() => {
    setActive(true);
    setPhase("in");
    setCount(DURATIONS.in);
  }, []);

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          setPhase((p) => {
            const idx = PHASES.indexOf(p);
            const next = PHASES[(idx + 1) % PHASES.length];
            return next;
          });
          return DURATIONS[PHASES[(PHASES.indexOf(phase) + 1) % PHASES.length]];
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [active, phase]);

  return (
    <div className="flex flex-col items-center gap-3">
      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key="breathing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-sunrise-bright/20 border-2 border-sunrise-bright flex items-center justify-center"
              animate={{
                scale: phase === "in" ? [1, 1.4] : phase === "out" ? [1.4, 1] : 1.4,
              }}
              transition={{ duration: DURATIONS[phase], ease: "easeInOut" }}
            >
              <span className="text-2xl font-heading font-bold text-sunrise-bright">{count}</span>
            </motion.div>
            <p className="text-sm font-medium text-sunrise-bright">{phaseLabel[phase]}</p>
            <button
              onClick={() => setActive(false)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
            >
              ✕
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={startExercise}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sunrise-bright/10 hover:bg-sunrise-bright/20 text-sunrise-bright text-sm font-medium transition-colors group"
          >
            <Wind className="w-4 h-4 group-hover:animate-pulse" />
            {t.startBreathing}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BreathingExercise;
