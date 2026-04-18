import { motion } from "framer-motion";
import type { CompanionMood, CompanionAppearance } from "@/lib/companion";

interface TalkingAvatarProps {
  mood: CompanionMood;
  appearance: CompanionAppearance;
  isTalking?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = { sm: 48, md: 80, lg: 128 };

const MOOD_FACE: Record<CompanionMood, { eyeScale: number; mouthPath: string; blush: boolean; browOffset: number }> = {
  happy: { eyeScale: 1, mouthPath: "M 14,22 Q 20,28 26,22", blush: true, browOffset: -1 },
  calm: { eyeScale: 0.9, mouthPath: "M 16,23 Q 20,25 24,23", blush: false, browOffset: 0 },
  sad: { eyeScale: 1.1, mouthPath: "M 14,26 Q 20,22 26,26", blush: false, browOffset: 2 },
  anxious: { eyeScale: 1.2, mouthPath: "M 15,24 L 18,23 L 22,25 L 25,23", blush: false, browOffset: -2 },
  excited: { eyeScale: 0.8, mouthPath: "M 13,22 Q 20,30 27,22", blush: true, browOffset: -2 },
  neutral: { eyeScale: 1, mouthPath: "M 16,24 L 24,24", blush: false, browOffset: 0 },
};

const MOOD_COLORS: Record<CompanionMood, { body: string; accent: string; glow: string }> = {
  // Vibrant pink/magenta
  happy: { body: "hsl(335,80%,60%)", accent: "hsl(335,80%,75%)", glow: "hsl(335,80%,60%)" },
  // Warm sunny coral
  calm: { body: "hsl(15,90%,60%)", accent: "hsl(15,90%,75%)", glow: "hsl(15,90%,60%)" },
  // Deep atmospheric purple, not depressing grey
  sad: { body: "hsl(280,50%,50%)", accent: "hsl(280,50%,65%)", glow: "hsl(280,50%,40%)" },
  // Red-orange
  anxious: { body: "hsl(0,85%,65%)", accent: "hsl(0,85%,75%)", glow: "hsl(0,85%,60%)" },
  // Bright glowing yellow/gold
  excited: { body: "hsl(40,100%,55%)", accent: "hsl(40,100%,70%)", glow: "hsl(40,100%,60%)" },
  // Soft warm peach
  neutral: { body: "hsl(25,80%,65%)", accent: "hsl(25,80%,80%)", glow: "hsl(25,80%,60%)" },
};

const APPEARANCE_EXTRAS: Record<CompanionAppearance, (colors: typeof MOOD_COLORS.happy) => React.ReactNode> = {
  orb: () => null,
  fox: (c) => (
    <>
      {/* Fox ears */}
      <polygon points="8,8 12,2 14,10" fill={c.body} stroke={c.accent} strokeWidth="0.5" />
      <polygon points="32,8 28,2 26,10" fill={c.body} stroke={c.accent} strokeWidth="0.5" />
      <polygon points="9.5,8 12,4 13,10" fill={c.accent} opacity="0.5" />
      <polygon points="30.5,8 28,4 27,10" fill={c.accent} opacity="0.5" />
    </>
  ),
  cat: (c) => (
    <>
      {/* Cat ears */}
      <polygon points="7,10 10,1 15,10" fill={c.body} stroke={c.accent} strokeWidth="0.5" />
      <polygon points="33,10 30,1 25,10" fill={c.body} stroke={c.accent} strokeWidth="0.5" />
      <polygon points="9,9 10,3 14,9" fill="hsl(340,60%,70%)" opacity="0.4" />
      <polygon points="31,9 30,3 26,9" fill="hsl(340,60%,70%)" opacity="0.4" />
      {/* Whiskers */}
      <line x1="5" y1="20" x2="14" y2="21" stroke={c.accent} strokeWidth="0.3" opacity="0.4" />
      <line x1="5" y1="22" x2="14" y2="22" stroke={c.accent} strokeWidth="0.3" opacity="0.4" />
      <line x1="35" y1="20" x2="26" y2="21" stroke={c.accent} strokeWidth="0.3" opacity="0.4" />
      <line x1="35" y1="22" x2="26" y2="22" stroke={c.accent} strokeWidth="0.3" opacity="0.4" />
    </>
  ),
  bird: (c) => (
    <>
      {/* Bird beak */}
      <polygon points="20,20 17,18 20,16" fill="hsl(35,80%,55%)" />
      {/* Small wing hints */}
      <ellipse cx="8" cy="22" rx="4" ry="6" fill={c.accent} opacity="0.3" transform="rotate(-15,8,22)" />
      <ellipse cx="32" cy="22" rx="4" ry="6" fill={c.accent} opacity="0.3" transform="rotate(15,32,22)" />
    </>
  ),
};

const TalkingAvatar = ({ mood, appearance, isTalking = false, size = "md" }: TalkingAvatarProps) => {
  const px = SIZE_MAP[size];
  const face = MOOD_FACE[mood];
  const colors = MOOD_COLORS[mood];
  const extras = APPEARANCE_EXTRAS[appearance];

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: px, height: px }}
      animate={{
        scale: mood === "excited" ? [1, 1.06, 1] : [1, 1.02, 1],
        rotate: mood === "anxious" ? [0, 1, -1, 0] : [0, 0],
      }}
      transition={{ duration: mood === "anxious" ? 1.5 : 3, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ boxShadow: `0 0 ${px / 3}px ${colors.glow}40` }}
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg viewBox="0 0 40 40" width={px} height={px} className="relative z-10">
        <defs>
          <radialGradient id={`bodyGrad-${mood}`} cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor={colors.accent} />
            <stop offset="100%" stopColor={colors.body} />
          </radialGradient>
          <filter id="shadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor={colors.glow} floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Appearance-specific extras (ears, etc) */}
        {extras(colors)}

        {/* Body */}
        <ellipse
          cx="20" cy="22" rx="14" ry="14"
          fill={`url(#bodyGrad-${mood})`}
          filter="url(#shadow)"
        />

        {/* Eyes */}
        <motion.g
          animate={{ scaleY: face.eyeScale }}
          style={{ transformOrigin: "20px 17px" }}
        >
          {/* Blink animation */}
          <motion.ellipse
            cx="14" cy={17 + face.browOffset * 0.3}
            rx="2" ry="2.2"
            fill="white"
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
          />
          <motion.ellipse
            cx="26" cy={17 + face.browOffset * 0.3}
            rx="2" ry="2.2"
            fill="white"
            animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
          />
          {/* Pupils */}
          <circle cx="14.5" cy={17.2 + face.browOffset * 0.3} r="1" fill="hsl(210,50%,10%)" />
          <circle cx="26.5" cy={17.2 + face.browOffset * 0.3} r="1" fill="hsl(210,50%,10%)" />
          {/* Eye shine */}
          <circle cx="15" cy={16.5 + face.browOffset * 0.3} r="0.4" fill="white" opacity="0.9" />
          <circle cx="27" cy={16.5 + face.browOffset * 0.3} r="0.4" fill="white" opacity="0.9" />
        </motion.g>

        {/* Blush */}
        {face.blush && (
          <>
            <circle cx="10" cy="21" r="2.5" fill="hsl(340,60%,70%)" opacity="0.25" />
            <circle cx="30" cy="21" r="2.5" fill="hsl(340,60%,70%)" opacity="0.25" />
          </>
        )}

        {/* Mouth - talking animation */}
        {isTalking ? (
          <motion.ellipse
            cx="20" cy="24"
            rx="3"
            fill="hsl(340,40%,35%)"
            animate={{ ry: [1, 2.5, 1.5, 2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <motion.path
            d={face.mouthPath}
            fill="none"
            stroke="hsl(210,50%,15%)"
            strokeWidth="1"
            strokeLinecap="round"
            initial={false}
            animate={{ d: face.mouthPath }}
            transition={{ duration: 0.4 }}
          />
        )}
      </svg>
    </motion.div>
  );
};

export default TalkingAvatar;
