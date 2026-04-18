import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import DailyQuote from "./DailyQuote";
import CompanionAvatar from "./CompanionAvatar";
import WaterEffect from "./WaterEffect";
import MoodDashboard from "./MoodDashboard";
import { useI18n } from "@/lib/i18n";
import { streamChat } from "@/lib/streamChat";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { Conversation } from "@/pages/Index";
import type { useCompanion } from "@/lib/companion";
import type { CompanionMood } from "@/lib/companion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  conversation: Conversation | null;
  companion: ReturnType<typeof useCompanion>;
  onLocalUpdate: (conv: Conversation) => void;
  ensureConversation: (convId: string, title: string) => Promise<string | null>;
  saveMessage: (conversationId: string, role: "user" | "assistant", content: string, id?: string) => Promise<void>;
}

// Simple mood detection from user text
function detectMood(text: string): CompanionMood {
  const lower = text.toLowerCase();
  const sadWords = ["sad", "depressed", "crying", "hopeless", "حزين", "أبكي", "يائس", "مكتئب"];
  const anxiousWords = ["anxious", "worried", "panic", "stress", "scared", "قلق", "خائف", "توتر", "ذعر"];
  const happyWords = ["happy", "great", "amazing", "wonderful", "joy", "سعيد", "رائع", "مذهل", "فرح"];
  const excitedWords = ["excited", "thrilled", "awesome", "can't wait", "متحمس", "متشوق"];

  if (sadWords.some((w) => lower.includes(w))) return "sad";
  if (anxiousWords.some((w) => lower.includes(w))) return "anxious";
  if (excitedWords.some((w) => lower.includes(w))) return "excited";
  if (happyWords.some((w) => lower.includes(w))) return "happy";
  return "calm";
}

const ChatPanel = ({ conversation, companion, onLocalUpdate, ensureConversation, saveMessage }: ChatPanelProps) => {
  const { t, dir } = useI18n();
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = conversation?.messages || [];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (content: string) => {
    const userMsgId = crypto.randomUUID();
    const userMsg: Message = { id: userMsgId, role: "user", content };

    const detectedMood = detectMood(content);
    companion.setMood(detectedMood);
    companion.recordMessage();

    const convId = conversation?.id || crypto.randomUUID();
    const title = conversation?.title || content.slice(0, 40) + (content.length > 40 ? "..." : "");
    const updatedMessages = [...messages, userMsg];

    onLocalUpdate({
      id: convId,
      title,
      messages: updatedMessages,
      createdAt: conversation?.createdAt || new Date(),
    });

    ensureConversation(convId, title).then((cid) => {
      if (cid) saveMessage(cid, "user", content, userMsgId);
    });

    setIsTyping(true);

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    const apiMessages = updatedMessages.map((m) => ({ role: m.role, content: m.content }));

    try {
      await streamChat({
        messages: apiMessages,
        onDelta: (chunk) => {
          assistantContent += chunk;
          onLocalUpdate({
            id: convId,
            title,
            messages: [
              ...updatedMessages,
              { id: assistantId, role: "assistant", content: assistantContent },
            ],
            createdAt: conversation?.createdAt || new Date(),
          });
        },
        onDone: () => {
          setIsTyping(false);
          if (assistantContent.trim()) {
            saveMessage(convId, "assistant", assistantContent, assistantId);
          }
        },
        onError: (error) => {
          toast.error(error);
          setIsTyping(false);
        },
      });
    } catch {
      toast.error("Failed to connect. Please try again.");
      setIsTyping(false);
    }
  };

  // Empty state
  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col h-full bg-background relative" dir={dir}>
        <WaterEffect />
        <div className="flex items-center px-4 py-3 border-b border-border bg-card/50">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <span className="ms-3 font-heading font-semibold text-foreground">{t.appName}</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center gap-4 max-w-md text-center"
          >
            <CompanionAvatar
              name={companion.companion.name}
              mood={companion.companion.mood}
              appearance={companion.companion.appearance}
              level={companion.companion.level}
              size="lg"
            />

            <div className="flex flex-col items-center gap-1.5 w-full mt-2">
              <div className="flex w-full justify-between items-center px-1">
                <span className="text-xs font-bold text-primary tracking-wide">
                  LVL {companion.companion.level}
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {companion.companion.xp} / {companion.companion.level >= 10 ? companion.companion.xp : companion.companion.level * 100} XP
                </span>
              </div>
              <div className="relative w-full h-2.5 bg-muted rounded-full overflow-hidden shadow-inner flex">
                <motion.div
                  className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-primary to-accent transition-all duration-1000 ease-out"
                  style={{ width: `${(companion.companion.xp / (companion.companion.level * 100)) * 100}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-pulse" />
                </motion.div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Talk to me to earn EXP! ✨</p>
            </div>

            <p className="text-muted-foreground text-sm leading-relaxed mb-1 mt-4">{t.subtitle}</p>

            <DailyQuote />

            {/* Quick Mood Logger */}
            <div className="w-full mt-4 p-4 border border-border bg-card/50 rounded-2xl flex flex-col gap-3 items-center">
              <span className="text-sm font-semibold text-foreground">How are you feeling right now?</span>
              <div className="flex gap-2 justify-center">
                {[
                  { id: "happy", emoji: "😄", color: "text-accent" },
                  { id: "excited", emoji: "🤩", color: "text-amber-500" },
                  { id: "calm", emoji: "😌", color: "text-primary" },
                  { id: "neutral", emoji: "😐", color: "text-muted-foreground" },
                  { id: "anxious", emoji: "😬", color: "text-orange-500" },
                  { id: "sad", emoji: "😔", color: "text-indigo-400" },
                ].map(m => (
                  <button 
                    key={m.id}
                    onClick={() => {
                      companion.recordMoodCheckin(m.id);
                      toast.success(dir === "rtl" ? "تم تسجيل مزاجك!" : "Mood tracked successfully! +10 XP");
                    }}
                    className="p-2 text-2xl hover:scale-125 transition-transform hover:bg-secondary rounded-full"
                    title={m.id}
                  >
                    {m.emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 w-full">
              {[
                dir === "rtl" ? "كيف أتعامل مع التوتر؟" : "How do I manage stress?",
                dir === "rtl" ? "أحتاج شخصاً يستمع إلي" : "I need someone to talk to",
                dir === "rtl" ? "ساعدني على الاسترخاء" : "Help me relax",
                dir === "rtl" ? "أشعر بالقلق اليوم" : "I'm feeling anxious today",
              ].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="p-3 rounded-xl border border-border bg-card hover:bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors text-start"
                >
                  {prompt}
                </button>
              ))}
            </div>
            
            <div className="w-full mt-6">
              <MoodDashboard companionState={companion} />
            </div>
          </motion.div>
        </div>

        <ChatInput onSend={handleSend} disabled={isTyping} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background relative" dir={dir}>
      <WaterEffect />
      {/* Header with companion avatar */}
      <div className="flex items-center px-4 py-3 border-b border-border bg-card/50 relative z-10">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="ms-3 flex items-center gap-2">
          <CompanionAvatar
            name={companion.companion.name}
            mood={companion.companion.mood}
            appearance={companion.companion.appearance}
            level={companion.companion.level}
            size="sm"
            showLabel={false}
            isTalking={isTyping}
          />
          <div>
            <span className="font-heading font-semibold text-foreground text-sm">{companion.companion.name}</span>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {isTyping ? (dir === "rtl" ? "يكتب..." : "typing...") : (dir === "rtl" ? "متصل" : "online")}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.map((msg, i) => (
            <ChatMessage key={msg.id} role={msg.role} content={msg.content} index={i} />
          ))}
          {isTyping && messages[messages.length - 1]?.role !== "assistant" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-muted-foreground text-sm"
            >
              <CompanionAvatar
                name={companion.companion.name}
                mood={companion.companion.mood}
                appearance={companion.companion.appearance}
                level={companion.companion.level}
                size="sm"
                showLabel={false}
                isTalking={true}
              />
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <ChatInput onSend={handleSend} disabled={isTyping} />
    </div>
  );
};

export default ChatPanel;
