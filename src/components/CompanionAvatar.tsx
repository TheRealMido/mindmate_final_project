import { motion } from "framer-motion";
import type { CompanionMood, CompanionAppearance } from "@/lib/companion";
import { LEVEL_TITLES } from "@/lib/companion";
import { useI18n } from "@/lib/i18n";
import TalkingAvatar from "./TalkingAvatar";

interface CompanionAvatarProps {
  name: string;
  mood: CompanionMood;
  appearance: CompanionAppearance;
  level: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  isTalking?: boolean;
}

const CompanionAvatar = ({ name, mood, appearance, level, size = "md", showLabel = true, isTalking = false }: CompanionAvatarProps) => {
  const { lang } = useI18n();
  const title = LEVEL_TITLES[Math.min(level, 10)];

  return (
    <div className="flex flex-col items-center gap-1.5">
      <TalkingAvatar
        mood={mood}
        appearance={appearance}
        isTalking={isTalking}
        size={size}
      />

      {showLabel && (
        <div className="text-center">
          <p className="text-xs font-heading font-semibold text-foreground leading-tight">{name}</p>
          <p className="text-[10px] text-muted-foreground">
            Lv.{level} · {lang === "ar" ? title.ar : title.en}
          </p>
        </div>
      )}
    </div>
  );
};

export default CompanionAvatar;
