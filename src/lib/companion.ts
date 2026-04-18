import { useState, useEffect, useCallback } from "react";

export type CompanionMood = "happy" | "calm" | "sad" | "anxious" | "excited" | "neutral";
export type CompanionAppearance = "orb" | "fox" | "cat" | "bird";
export type CompanionVoiceId =
  | "EXAVITQu4vr4xnSDxMaL" // Sarah - warm female
  | "XrExE9yKIg1WjnnlVkGX" // Matilda - soft female
  | "JBFqnCBsd6RMkjVDRZzb" // George - warm male
  | "onwK4e9ZLuTAKqWW03F9"; // Daniel - calm male

export const VOICE_OPTIONS: { id: CompanionVoiceId; en: string; ar: string; gender: "female" | "male"; emoji: string }[] = [
  { id: "EXAVITQu4vr4xnSDxMaL", en: "Sarah", ar: "سارة", gender: "female", emoji: "👩" },
  { id: "XrExE9yKIg1WjnnlVkGX", en: "Matilda", ar: "ماتيلدا", gender: "female", emoji: "👩‍🦰" },
  { id: "JBFqnCBsd6RMkjVDRZzb", en: "George", ar: "جورج", gender: "male", emoji: "👨" },
  { id: "onwK4e9ZLuTAKqWW03F9", en: "Daniel", ar: "دانيال", gender: "male", emoji: "👨‍🦱" },
];

export interface CompanionState {
  name: string;
  appearance: CompanionAppearance;
  voiceId: CompanionVoiceId;
  mood: CompanionMood;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  unlockedItems: string[];
  totalMessages: number;
  totalBreathingSessions: number;
  totalMoodCheckins: number;
  moodHistory: { date: string; mood: CompanionMood }[];
}

const STORAGE_KEY = "mindmate-companion";

const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 800, 1200, 1800, 2500, 3500];

export const XP_REWARDS = {
  sendMessage: 5,
  breathingExercise: 15,
  moodCheckin: 10,
  dailyLogin: 20,
  streakBonus: 10, // per day of streak
};

export const LEVEL_TITLES: Record<number, { en: string; ar: string }> = {
  1: { en: "Seedling", ar: "بذرة" },
  2: { en: "Sprout", ar: "برعم" },
  3: { en: "Bloom", ar: "زهرة" },
  4: { en: "Guardian", ar: "حارس" },
  5: { en: "Sage", ar: "حكيم" },
  6: { en: "Luminary", ar: "منير" },
  7: { en: "Zenith", ar: "قمة" },
  8: { en: "Ethereal", ar: "أثيري" },
  9: { en: "Transcendent", ar: "متسامٍ" },
  10: { en: "Enlightened", ar: "مستنير" },
};

export const UNLOCKABLE_ITEMS: { id: string; level: number; en: string; ar: string; emoji: string }[] = [
  { id: "aura_calm", level: 2, en: "Calm Aura", ar: "هالة الهدوء", emoji: "🔵" },
  { id: "aura_warm", level: 3, en: "Warm Glow", ar: "توهج دافئ", emoji: "🟠" },
  { id: "sparkles", level: 4, en: "Sparkle Trail", ar: "أثر بريق", emoji: "✨" },
  { id: "crown", level: 5, en: "Serenity Crown", ar: "تاج السكينة", emoji: "👑" },
  { id: "wings", level: 6, en: "Zen Wings", ar: "أجنحة زِن", emoji: "🕊️" },
  { id: "rainbow", level: 7, en: "Rainbow Shield", ar: "درع قوس قزح", emoji: "🌈" },
  { id: "star", level: 8, en: "Star Mantle", ar: "عباءة النجوم", emoji: "⭐" },
  { id: "lotus", level: 9, en: "Lotus Bloom", ar: "تفتح اللوتس", emoji: "🪷" },
  { id: "celestial", level: 10, en: "Celestial Form", ar: "الشكل السماوي", emoji: "🌟" },
];

function getDefaultState(): CompanionState {
  return {
    name: "Noor",
    appearance: "orb",
    voiceId: "EXAVITQu4vr4xnSDxMaL",
    mood: "neutral",
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: "",
    unlockedItems: [],
    totalMessages: 0,
    totalBreathingSessions: 0,
    totalMoodCheckins: 0,
    moodHistory: [],
  };
}

function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXpForNextLevel(level: number): number {
  if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return LEVEL_THRESHOLDS[level]; // next level threshold
}

export function getXpProgress(xp: number, level: number): number {
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || currentThreshold + 100;
  return ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100;
}

function loadState(): CompanionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...getDefaultState(), ...JSON.parse(raw) };
  } catch {}
  return getDefaultState();
}

function saveState(state: CompanionState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useCompanion() {
  const [state, setState] = useState<CompanionState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  // Check daily login bonus
  useEffect(() => {
    const today = new Date().toDateString();
    if (state.lastActiveDate !== today) {
      setState((prev) => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const isConsecutive = prev.lastActiveDate === yesterday.toDateString();
        const newStreak = isConsecutive ? prev.streak + 1 : 1;
        const bonusXp = XP_REWARDS.dailyLogin + (isConsecutive ? XP_REWARDS.streakBonus * newStreak : 0);
        const newXp = prev.xp + bonusXp;
        const newLevel = calculateLevel(newXp);
        const newUnlocks = UNLOCKABLE_ITEMS
          .filter((item) => item.level <= newLevel && !prev.unlockedItems.includes(item.id))
          .map((item) => item.id);
        return {
          ...prev,
          lastActiveDate: today,
          streak: newStreak,
          xp: newXp,
          level: newLevel,
          unlockedItems: [...prev.unlockedItems, ...newUnlocks],
        };
      });
    }
  }, []);

  const addXp = useCallback((amount: number) => {
    setState((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = calculateLevel(newXp);
      const newUnlocks = UNLOCKABLE_ITEMS
        .filter((item) => item.level <= newLevel && !prev.unlockedItems.includes(item.id))
        .map((item) => item.id);
      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        unlockedItems: [...prev.unlockedItems, ...newUnlocks],
      };
    });
  }, []);

  const setMood = useCallback((mood: CompanionMood) => {
    setState((prev) => ({ ...prev, mood }));
  }, []);

  const setName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, name }));
  }, []);

  const setAppearance = useCallback((appearance: CompanionAppearance) => {
    setState((prev) => ({ ...prev, appearance }));
  }, []);

  const setVoiceId = useCallback((voiceId: CompanionVoiceId) => {
    setState((prev) => ({ ...prev, voiceId }));
  }, []);

  const recordMessage = useCallback(() => {
    setState((prev) => ({ ...prev, totalMessages: prev.totalMessages + 1 }));
    addXp(XP_REWARDS.sendMessage);
  }, [addXp]);

  const recordBreathing = useCallback(() => {
    setState((prev) => ({ ...prev, totalBreathingSessions: prev.totalBreathingSessions + 1 }));
    addXp(XP_REWARDS.breathingExercise);
  }, [addXp]);

  const recordMoodCheckin = useCallback((moodStr: string) => {
    // try to map it back to a CompanionMood if possible, otherwise just use "neutral"
    const validMoods = ["happy", "calm", "sad", "anxious", "excited", "neutral"] as CompanionMood[];
    let detectedStatus: CompanionMood = "neutral";
    for (const valid of validMoods) {
      if (moodStr.toLowerCase().includes(valid) || valid.includes(moodStr.toLowerCase())) {
        detectedStatus = valid;
        break;
      }
    }
    // Hard fallback mapping based on Sidebar UI translations
    if (moodStr.includes("great") || moodStr.includes("رائع")) detectedStatus = "happy";
    if (moodStr.includes("good") || moodStr.includes("جيد")) detectedStatus = "calm";
    if (moodStr.includes("okay") || moodStr.includes("عادي")) detectedStatus = "neutral";
    if (moodStr.includes("low") || moodStr.includes("منخفض")) detectedStatus = "sad";

    setState((prev) => ({ 
      ...prev, 
      totalMoodCheckins: prev.totalMoodCheckins + 1,
      moodHistory: [...(prev.moodHistory || []), { date: new Date().toISOString(), mood: detectedStatus }].slice(-30) // keep last 30
    }));
    addXp(XP_REWARDS.moodCheckin);
  }, [addXp]);

  return {
    companion: state,
    addXp,
    setMood,
    setName,
    setAppearance,
    setVoiceId,
    recordMessage,
    recordBreathing,
    recordMoodCheckin,
  };
}
