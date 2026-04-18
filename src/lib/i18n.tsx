import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Language = "en" | "ar";

interface Translations {
  appName: string;
  subtitle: string;
  online: string;
  welcomeMessage: string;
  placeholder: string;
  howFeeling: string;
  wellnessTips: string;
  disclaimer: string;
  thinking: string;
  moodGreat: string;
  moodGood: string;
  moodOkay: string;
  moodLow: string;
  tipBreathe: string;
  tipGratitude: string;
  tipStretch: string;
  tipWrite: string;
  breathe: string;
  breatheIn: string;
  holdBreath: string;
  breatheOut: string;
  startBreathing: string;
  moodTracked: string;
  responses: string[];
}

const translations: Record<Language, Translations> = {
  en: {
    appName: "MindMate",
    subtitle: "Your mental wellness companion",
    online: "Online",
    welcomeMessage:
      "Hello! I'm **MindMate**, your mental wellness companion. 💙\n\nI'm here to listen, support, and help you explore your thoughts and feelings. Whether you want to talk about your day, work through something difficult, or just need a moment of calm — I'm here for you.\n\nWhat's on your mind today?",
    placeholder: "Share what's on your mind...",
    howFeeling: "How are you feeling?",
    wellnessTips: "Wellness Tips",
    disclaimer:
      "💙 MindMate is here to listen, not to diagnose. If you're in crisis, please reach out to a professional.",
    thinking: "MindMate is thinking...",
    moodGreat: "Great",
    moodGood: "Good",
    moodOkay: "Okay",
    moodLow: "Low",
    tipBreathe: "Take 3 deep breaths. Inhale for 4s, hold 4s, exhale 4s.",
    tipGratitude: "Name 3 things you're grateful for today.",
    tipStretch: "Stand up and stretch for 60 seconds.",
    tipWrite: "Write down one worry, then let it go.",
    breathe: "Breathing Exercise",
    breatheIn: "Breathe In",
    holdBreath: "Hold",
    breatheOut: "Breathe Out",
    startBreathing: "Start Breathing",
    moodTracked: "Mood recorded! Take care of yourself 💙",
    responses: [
      "Thank you for sharing that with me. It takes courage to express how you're feeling. Can you tell me more about what's been weighing on you?",
      "I hear you, and your feelings are completely valid. Sometimes just acknowledging our emotions can be a powerful first step. What do you think might help you feel a little better right now?",
      "That sounds like it's been really challenging. Remember, it's okay to not be okay sometimes. Would you like to try a quick breathing exercise together?",
      "I appreciate you trusting me with this. Let's take a moment to break this down — what feels like the most pressing thing right now?",
      "It's really brave of you to talk about this. Many people experience similar feelings. What has helped you cope in the past when you've felt this way?",
      "I'm glad you're reaching out. Let's focus on what you can control right now. Can you name one small thing that brought you a moment of peace today?",
    ],
  },
  ar: {
    appName: "مايند ميت",
    subtitle: "رفيقك في العناية بالصحة النفسية",
    online: "متصل",
    welcomeMessage:
      "مرحباً! أنا **مايند ميت**، رفيقك في العناية بالصحة النفسية. 💙\n\nأنا هنا لأستمع إليك، وأدعمك، وأساعدك في استكشاف أفكارك ومشاعرك. سواء كنت تريد التحدث عن يومك، أو التعامل مع شيء صعب، أو تحتاج فقط إلى لحظة من الهدوء — أنا هنا من أجلك.\n\nما الذي يشغل بالك اليوم؟",
    placeholder: "شاركنا ما يدور في ذهنك...",
    howFeeling: "كيف تشعر الآن؟",
    wellnessTips: "نصائح للعافية",
    disclaimer:
      "💙 مايند ميت هنا للاستماع وليس للتشخيص. إذا كنت تمر بأزمة، يرجى التواصل مع مختص.",
    thinking: "مايند ميت يفكر...",
    moodGreat: "رائع",
    moodGood: "جيد",
    moodOkay: "لا بأس",
    moodLow: "منخفض",
    tipBreathe: "خذ ٣ أنفاس عميقة. استنشق لمدة ٤ ثوانٍ، احبس ٤ ثوانٍ، ازفر ٤ ثوانٍ.",
    tipGratitude: "اذكر ٣ أشياء تشعر بالامتنان لها اليوم.",
    tipStretch: "قف وتمدد لمدة ٦٠ ثانية.",
    tipWrite: "اكتب قلقاً واحداً، ثم دعه يذهب.",
    breathe: "تمرين التنفس",
    breatheIn: "استنشق",
    holdBreath: "احبس",
    breatheOut: "ازفر",
    startBreathing: "ابدأ التنفس",
    moodTracked: "تم تسجيل مزاجك! اعتنِ بنفسك 💙",
    responses: [
      "شكراً لمشاركتك هذا معي. يتطلب الأمر شجاعة للتعبير عن مشاعرك. هل يمكنك إخباري المزيد عما يثقل كاهلك؟",
      "أسمعك، ومشاعرك صحيحة تماماً. أحياناً مجرد الاعتراف بمشاعرنا يمكن أن يكون خطوة أولى قوية. ما الذي تعتقد أنه قد يساعدك على الشعور بتحسن قليل الآن؟",
      "يبدو أن الأمر كان صعباً حقاً. تذكر، لا بأس أن لا تكون بخير أحياناً. هل ترغب في تجربة تمرين تنفس سريع معاً؟",
      "أقدر ثقتك بي في هذا الأمر. لنأخذ لحظة لتحليل هذا — ما الذي يبدو أكثر إلحاحاً الآن؟",
      "من الشجاعة حقاً أن تتحدث عن هذا. كثير من الناس يمرون بمشاعر مماثلة. ما الذي ساعدك في التأقلم سابقاً عندما شعرت بهذه الطريقة؟",
      "أنا سعيد أنك تتواصل. لنركز على ما يمكنك التحكم فيه الآن. هل يمكنك ذكر شيء صغير واحد جلب لك لحظة سلام اليوم؟",
    ],
  },
};

interface I18nContextType {
  lang: Language;
  t: Translations;
  toggleLang: () => void;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>("en");

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === "en" ? "ar" : "en"));
  }, []);

  const value: I18nContextType = {
    lang,
    t: translations[lang],
    toggleLang,
    dir: lang === "ar" ? "rtl" : "ltr",
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
