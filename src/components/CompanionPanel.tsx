import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Flame, Star, Zap, Trophy, Sparkles } from "lucide-react";
import { toast } from "sonner";
import CompanionAvatar from "./CompanionAvatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import {
  type CompanionAppearance,
  type CompanionState,
  getXpProgress,
  getXpForNextLevel,
  LEVEL_TITLES,
  UNLOCKABLE_ITEMS,
} from "@/lib/companion";

interface CompanionPanelProps {
  companion: CompanionState;
  onSetName: (name: string) => void;
  onSetAppearance: (appearance: CompanionAppearance) => void;
}

const APPEARANCES: { id: CompanionAppearance; emoji: string; en: string; ar: string }[] = [
  { id: "orb", emoji: "💎", en: "Spirit Orb", ar: "كرة الروح" },
  { id: "fox", emoji: "🦊", en: "Zen Fox", ar: "ثعلب زِن" },
  { id: "cat", emoji: "🐱", en: "Calm Cat", ar: "قطة هادئة" },
  { id: "bird", emoji: "🐦", en: "Free Bird", ar: "طائر حر" },
];

const CompanionPanel = ({ companion, onSetName, onSetAppearance }: CompanionPanelProps) => {
  const { lang, dir } = useI18n();
  const [showSettings, setShowSettings] = useState(false);
  const [editName, setEditName] = useState(companion.name);

  const xpProgress = getXpProgress(companion.xp, companion.level);
  const nextLevelXp = getXpForNextLevel(companion.level);
  const title = LEVEL_TITLES[Math.min(companion.level, 10)];

  const handleSaveName = () => {
    if (editName.trim()) {
      onSetName(editName.trim());
      toast.success(lang === "ar" ? "تم تحديث الاسم!" : "Name updated!");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4" dir={dir}>
      {/* Avatar + Stats */}
      <div className="flex flex-col items-center gap-3">
        <CompanionAvatar
          name={companion.name}
          mood={companion.mood}
          appearance={companion.appearance}
          level={companion.level}
          size="lg"
        />

        {/* XP Bar */}
        <div className="w-full max-w-[180px]">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {companion.xp} XP</span>
            <span>{nextLevelXp} XP</span>
          </div>
          <Progress value={xpProgress} className="h-2" />
        </div>

        {/* Streak */}
        {companion.streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium"
          >
            <Flame className="w-3.5 h-3.5" />
            {companion.streak} {lang === "ar" ? "يوم متتالي" : "day streak"}
          </motion.div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { icon: Zap, value: companion.totalMessages, label: lang === "ar" ? "رسائل" : "Msgs" },
          { icon: Sparkles, value: companion.totalBreathingSessions, label: lang === "ar" ? "تنفس" : "Breathe" },
          { icon: Trophy, value: companion.totalMoodCheckins, label: lang === "ar" ? "مزاج" : "Moods" },
        ].map((stat) => (
          <div key={stat.label} className="p-2 rounded-xl bg-muted/50">
            <stat.icon className="w-3.5 h-3.5 text-primary mx-auto mb-0.5" />
            <p className="text-sm font-heading font-bold text-foreground">{stat.value}</p>
            <p className="text-[9px] text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Unlocked Items */}
      {companion.unlockedItems.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider font-heading font-semibold text-muted-foreground mb-2">
            {lang === "ar" ? "العناصر المفتوحة" : "Unlocked"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {UNLOCKABLE_ITEMS.filter((item) => companion.unlockedItems.includes(item.id)).map((item) => (
              <motion.div
                key={item.id}
                whileHover={{ scale: 1.15 }}
                className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm cursor-default"
                title={lang === "ar" ? item.ar : item.en}
              >
                {item.emoji}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Settings Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowSettings(!showSettings)}
        className="w-full justify-start gap-2 text-xs text-muted-foreground"
      >
        <Settings className="w-3.5 h-3.5" />
        {lang === "ar" ? "تخصيص الرفيق" : "Customize Companion"}
      </Button>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-3"
          >
            {/* Name */}
            <div>
              <label className="text-[10px] uppercase tracking-wider font-heading font-semibold text-muted-foreground block mb-1.5">
                {lang === "ar" ? "الاسم" : "Name"}
              </label>
              <div className="flex gap-2">
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-8 text-sm rounded-lg"
                  maxLength={20}
                />
                <Button size="sm" onClick={handleSaveName} className="h-8 rounded-lg px-3 text-xs">
                  {lang === "ar" ? "حفظ" : "Save"}
                </Button>
              </div>
            </div>

            {/* Appearance */}
            <div>
              <label className="text-[10px] uppercase tracking-wider font-heading font-semibold text-muted-foreground block mb-1.5">
                {lang === "ar" ? "المظهر" : "Appearance"}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {APPEARANCES.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => onSetAppearance(a.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-all ${
                      companion.appearance === a.id
                        ? "bg-primary/10 ring-2 ring-primary text-foreground"
                        : "bg-muted hover:bg-secondary text-muted-foreground"
                    }`}
                  >
                    <span className="text-base">{a.emoji}</span>
                    <span>{lang === "ar" ? a.ar : a.en}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompanionPanel;
