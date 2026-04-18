import { motion } from "framer-motion";
import { Smile, Sun, Meh, Frown, Sparkles, Activity, Calendar } from "lucide-react";
import { useCompanion } from "@/lib/companion";
import { useI18n } from "@/lib/i18n";
import { format, subDays, isSameDay } from "date-fns";

const MOOD_METADATA = {
  happy: { color: "text-accent", bg: "bg-accent/10", icon: Smile, fill: 100 },
  excited: { color: "text-amber-500", bg: "bg-amber-500/10", icon: Sparkles, fill: 90 },
  calm: { color: "text-primary", bg: "bg-primary/10", icon: Sun, fill: 75 },
  neutral: { color: "text-muted-foreground", bg: "bg-muted", icon: Meh, fill: 50 },
  anxious: { color: "text-orange-500", bg: "bg-orange-500/10", icon: Activity, fill: 35 },
  sad: { color: "text-indigo-400", bg: "bg-indigo-400/10", icon: Frown, fill: 20 },
};

interface MoodDashboardProps {
  companionState: ReturnType<typeof useCompanion>;
}

const MoodDashboard = ({ companionState }: MoodDashboardProps) => {
  const { companion } = companionState;
  const { t, dir } = useI18n();

  // Get last 7 days including today
  const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), 6 - i));

  return (
    <div className="w-full flex flex-col gap-6 p-4" dir={dir}>
      <div className="flex flex-col gap-1">
        <h3 className="font-heading font-bold text-lg text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {dir === "rtl" ? "رحلة مزاجك" : "Mood Journey"}
        </h3>
        <p className="text-sm text-muted-foreground">
          {dir === "rtl" ? "تتبع مشاعرك خلال 7 أيام" : "Track your feelings over 7 days"}
        </p>
      </div>

      {/* 7-day Bar Chart */}
      <div className="flex items-end justify-between h-40 gap-2 bg-card border border-border p-5 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />
        
        {last7Days.map((date, idx) => {
          // Find the last mood entered on this date
          const rawHistory = companion.moodHistory || [];
          const entriesForDate = rawHistory.filter(entry => isSameDay(new Date(entry.date), date));
          const lastEntry = entriesForDate[entriesForDate.length - 1]; // last of that day
          const mood = lastEntry ? lastEntry.mood : null;
          const meta = mood ? MOOD_METADATA[mood] : null;

          return (
            <div key={idx} className="flex flex-col items-center gap-3 flex-1 group z-10 relative">
              <div className="h-24 w-full flex items-end justify-center">
                {mood && meta ? (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${meta.fill}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.1 }}
                    className={`w-full max-w-[28px] rounded-t-lg rounded-b-sm ${meta.bg}`}
                  >
                    <div className={`w-full h-1 bg-current ${meta.color} rounded-t-lg mx-auto opacity-50`} />
                  </motion.div>
                ) : (
                  <div className="w-full max-w-[28px] h-2 bg-muted rounded-full" />
                )}
              </div>
              
              <div className="flex flex-col items-center gap-1">
                {mood && meta ? (
                  <meta.icon className={`w-4 h-4 ${meta.color}`} />
                ) : (
                  <div className="w-4 h-4" /> // spacer
                )}
                <span className="text-[10px] font-medium text-muted-foreground opacity-60">
                  {format(date, "EEE")}
                </span>
              </div>
              
              {/* Tooltip on hover */}
              {mood && (
                <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-foreground text-background text-[10px] py-1 px-2 rounded font-medium z-20 pointer-events-none whitespace-nowrap">
                  {mood}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Mini Stats */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="bg-secondary/50 border border-border p-4 rounded-2xl flex flex-col items-center text-center gap-1">
          <span className="font-heading font-bold text-2xl text-foreground">{companionState.companion.totalMoodCheckins}</span>
          <span className="text-xs text-muted-foreground">{dir === "rtl" ? "تسجيلات مزاج" : "Total Check-ins"}</span>
        </div>
        <div className="bg-secondary/50 border border-border p-4 rounded-2xl flex flex-col items-center text-center gap-1">
          <span className="font-heading font-bold text-2xl text-foreground">{companionState.companion.streak}</span>
          <span className="text-xs text-muted-foreground">{dir === "rtl" ? "أيام متتالية" : "Day Streak"}</span>
        </div>
      </div>
    </div>
  );
};

export default MoodDashboard;
