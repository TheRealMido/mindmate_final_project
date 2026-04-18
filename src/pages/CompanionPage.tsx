import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Volume2, VolumeX, ArrowLeft, Settings2 } from "lucide-react";
import { toast } from "sonner";
import TalkingAvatar from "@/components/TalkingAvatar";
import WaterEffect from "@/components/WaterEffect";
import { useI18n, I18nProvider } from "@/lib/i18n";
import { useCompanion, getXpForNextLevel, getXpProgress } from "@/lib/companion";
import Confetti from "react-confetti";
import { speakText, transcribeAudio, useAudioRecorder } from "@/lib/voice";
import { streamChat } from "@/lib/streamChat";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { CompanionMood } from "@/lib/companion";
import { VOICE_OPTIONS } from "@/lib/companion";
import LanguageToggle from "@/components/LanguageToggle";

function detectMood(text: string): CompanionMood {
  const lower = text.toLowerCase();
  const sadWords = ["sad", "depressed", "crying", "hopeless", "حزين", "أبكي", "يائس", "مكتئب"];
  const anxiousWords = ["anxious", "worried", "panic", "stress", "scared", "قلق", "خائف", "توتر"];
  const happyWords = ["happy", "great", "amazing", "wonderful", "سعيد", "رائع", "مذهل"];
  const excitedWords = ["excited", "thrilled", "awesome", "متحمس", "متشوق"];
  if (sadWords.some((w) => lower.includes(w))) return "sad";
  if (anxiousWords.some((w) => lower.includes(w))) return "anxious";
  if (excitedWords.some((w) => lower.includes(w))) return "excited";
  if (happyWords.some((w) => lower.includes(w))) return "happy";
  return "calm";
}

const CompanionPageContent = () => {
  const { t, lang, dir } = useI18n();
  const { companion, setMood, setName, setAppearance, setVoiceId, recordMessage } = useCompanion();
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const [conversationHistory, setConversationHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recorder = useRef(useAudioRecorder());
  const [showConfetti, setShowConfetti] = useState(false);
  const prevLevel = useRef(companion.level);

  // Monitor for level ups to trigger confetti
  useEffect(() => {
    if (companion.level > prevLevel.current) {
      setShowConfetti(true);
      toast.success(lang === "ar" ? `تهانينا! ${companion.name} وصل للمستوى ${companion.level} 🎉` : `Congratulations! ${companion.name} reached Level ${companion.level} 🎉`, { duration: 5000 });
      setTimeout(() => setShowConfetti(false), 6000);
    }
    prevLevel.current = companion.level;
  }, [companion.level, companion.name, lang]);

  const statusText = isRecording
    ? lang === "ar" ? "🎤 أستمع إليك..." : "🎤 Listening..."
    : isProcessing
    ? lang === "ar" ? "💭 أفكر..." : "💭 Thinking..."
    : isSpeaking
    ? lang === "ar" ? "🗣️ أتحدث..." : "🗣️ Speaking..."
    : lang === "ar" ? "اضغط على المايكروفون للتحدث" : "Tap the microphone to talk";

  const handleStartRecording = useCallback(async () => {
    try {
      await recorder.current.start();
      setIsRecording(true);
      setTranscript("");
      setResponse("");
    } catch {
      toast.error(lang === "ar" ? "لا يمكن الوصول إلى الميكروفون" : "Cannot access microphone");
    }
  }, [lang]);

  const handleStopRecording = useCallback(async () => {
    setIsRecording(false);
    setIsProcessing(true);

    try {
      const audioBlob = await recorder.current.stop();
      const text = await transcribeAudio(audioBlob);

      if (!text.trim()) {
        toast.info(lang === "ar" ? "لم أسمع شيئاً، حاول مرة أخرى" : "I didn't catch that, try again");
        setIsProcessing(false);
        return;
      }

      setTranscript(text);
      const detectedMood = detectMood(text);
      setMood(detectedMood);
      recordMessage();

      const updatedHistory = [...conversationHistory, { role: "user" as const, content: text }];
      setConversationHistory(updatedHistory);

      // Get AI response
      let fullResponse = "";
      await streamChat({
        messages: updatedHistory,
        onDelta: (chunk) => {
          fullResponse += chunk;
          setResponse(fullResponse);
        },
        onDone: async () => {
          setIsProcessing(false);
          setConversationHistory((prev) => [...prev, { role: "assistant", content: fullResponse }]);

          // Speak the response
          if (!isMuted && fullResponse) {
            try {
              setIsSpeaking(true);
              const audio = await speakText(fullResponse.slice(0, 500), lang, companion.voiceId);
              audioRef.current = audio;
              audio.onended = () => setIsSpeaking(false);
              await audio.play();
            } catch (err) {
              console.error("TTS error:", err);
              setIsSpeaking(false);
            }
          }
        },
        onError: (error) => {
          toast.error(error);
          setIsProcessing(false);
        },
      });
    } catch (err) {
      console.error("Voice pipeline error:", err);
      toast.error(lang === "ar" ? "حدث خطأ، حاول مرة أخرى" : "Something went wrong, try again");
      setIsProcessing(false);
    }
  }, [conversationHistory, lang, isMuted, setMood, recordMessage, companion.voiceId]);

  const toggleMute = () => {
    if (audioRef.current && isSpeaking) {
      audioRef.current.pause();
      setIsSpeaking(false);
    }
    setIsMuted((m) => !m);
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-background overflow-hidden" dir={dir}>
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={500} gravity={0.15} />}
      <WaterEffect />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Link to="/">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <span className="font-heading font-semibold text-foreground">{companion.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <Button variant="ghost" size="icon" onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="text-muted-foreground hover:text-foreground">
            <Settings2 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="relative z-10 overflow-hidden border-b border-border bg-card/90 backdrop-blur-sm"
          >
            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {lang === "ar" ? "الاسم" : "Name"}
                </label>
                <input
                  type="text"
                  value={companion.name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {lang === "ar" ? "الشكل" : "Appearance"}
                </label>
                <div className="flex gap-2">
                  {(["fox", "cat", "bird", "orb"] as const).map((a) => (
                    <button
                      key={a}
                      onClick={() => setAppearance(a)}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                        companion.appearance === a
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      {a === "fox" ? "🦊" : a === "cat" ? "🐱" : a === "bird" ? "🐦" : "🔮"} {a}
                    </button>
                  ))}
                </div>
              </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {lang === "ar" ? "الصوت" : "Voice"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {VOICE_OPTIONS.map((v) => (
                    <button
                      key={v.id}
                      onClick={async () => {
                        setVoiceId(v.id);
                        try {
                          const sample = lang === "ar" ? "مرحباً، أنا هنا من أجلك." : "Hey, I'm right here with you.";
                          if (audioRef.current) audioRef.current.pause();
                          const audio = await speakText(sample, lang, v.id);
                          audioRef.current = audio;
                          await audio.play();
                        } catch (err) {
                          console.error("Voice preview error:", err);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm border transition-colors flex items-center gap-2 ${
                        companion.voiceId === v.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground hover:bg-secondary"
                      }`}
                    >
                      <span>{v.emoji}</span>
                      <span className="truncate">{lang === "ar" ? v.ar : v.en}</span>
                      <span className="ms-auto text-[10px] uppercase tracking-wider opacity-60">
                        {v.gender === "female" ? (lang === "ar" ? "أنثى" : "F") : (lang === "ar" ? "ذكر" : "M")}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main area - Avatar */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-center gap-6 px-6">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, mass: 1.2 }}
        >
          <TalkingAvatar
            mood={companion.mood}
            appearance={companion.appearance}
            isTalking={isSpeaking}
            size="lg"
          />
        </motion.div>

        {/* Name and level / Gamification */}
        <div className="text-center w-full max-w-xs space-y-2">
          <h2 className="font-heading text-xl font-bold text-foreground">{companion.name}</h2>
          
          <div className="flex flex-col items-center gap-1.5 w-full">
            <div className="flex w-full justify-between items-center px-1">
              <span className="text-xs font-bold text-primary tracking-wide">
                LVL {companion.level}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {companion.xp} / {getXpForNextLevel(companion.level)} XP
              </span>
            </div>
            
            {/* Glowing EXP Bar */}
            <div className="relative w-full h-2.5 bg-muted rounded-full overflow-hidden shadow-inner flex">
              <motion.div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                style={{ width: `${getXpProgress(companion.xp, companion.level)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
              </motion.div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2 opacity-80">
            {companion.mood.charAt(0).toUpperCase() + companion.mood.slice(1)} • {companion.streak} {lang === "ar" ? "يوم" : "Day Streak"} 🔥
          </p>
        </div>

        {/* Status */}
        <motion.p
          key={statusText}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-muted-foreground text-center"
        >
          {statusText}
        </motion.p>

        {/* Transcript & Response */}
        <div className="w-full max-w-md space-y-2 min-h-[80px]">
          {transcript && (
            <motion.div
              initial={{ opacity: 0, x: dir === "rtl" ? -10 : 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-foreground"
            >
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                {lang === "ar" ? "أنت" : "You"}
              </span>
              {transcript}
            </motion.div>
          )}
          {response && (
            <motion.div
              initial={{ opacity: 0, x: dir === "rtl" ? 10 : -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-3 rounded-xl bg-accent/10 border border-accent/20 text-sm text-foreground max-h-32 overflow-y-auto"
            >
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-1">
                {companion.name}
              </span>
              {response}
            </motion.div>
          )}
        </div>
      </div>

      {/* Mic Button */}
      <div className="relative z-10 flex justify-center pb-8">
        <motion.button
          whileHover={{ scale: 1.08, rotate: [0, -5, 5, -5, 0] }}
          whileTap={{ scale: 0.85 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isProcessing}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-colors shadow-lg ${
            isRecording
              ? "bg-destructive text-destructive-foreground"
              : isProcessing
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}

          {/* Recording pulse */}
          {isRecording && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-destructive"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>
      </div>
    </div>
  );
};

const CompanionPage = () => (
  <I18nProvider>
    <CompanionPageContent />
  </I18nProvider>
);

export default CompanionPage;
