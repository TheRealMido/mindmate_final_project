import { useState, type FormEvent, useRef, useEffect } from "react";
import { ArrowUp, Mic, Square, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";
import { transcribeAudio, useAudioRecorder } from "@/lib/voice";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const { t, dir } = useI18n();
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recorderRef = useRef<ReturnType<typeof useAudioRecorder> | null>(null);
  const recognitionRef = useRef<any>(null);
  if (!recorderRef.current) recorderRef.current = useAudioRecorder();

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }, [input]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleMicClick = async () => {
    if (transcribing || disabled) return;
    
    // START RECORDING
    if (!recording) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      // Setup Web Speech API if supported
      if (SpeechRecognition && !recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = dir === "rtl" ? "ar-SA" : "en-US";
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onstart = () => {
          setRecording(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          if (text && text.trim()) {
            onSend(text.trim());
          } else {
            toast.error(dir === "rtl" ? "لم يتم سماع كلام" : "Couldn't hear that — try again");
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          if (event.error !== "aborted") {
            toast.error(dir === "rtl" ? "التعرف على الصوت فشل: " + event.error : "Speech recognition failed: " + event.error);
          }
        };

        recognitionRef.current.onend = () => {
          setRecording(false);
          setTranscribing(false);
          recognitionRef.current = null;
        };
      }

      // Try starting Web Speech API first
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          return;
        } catch (e) {
          console.error("Web Speech API start error", e);
        }
      }

      // Fallback: ElevenLabs recording
      try {
        await recorderRef.current!.start();
        setRecording(true);
      } catch {
        toast.error(dir === "rtl" ? "تعذر الوصول إلى الميكروفون" : "Microphone access denied");
      }
      return;
    }

    // STOP RECORDING
    if (recognitionRef.current) {
      setTranscribing(true); // Show loader briefly until onend/onresult
      recognitionRef.current.stop();
      return;
    }

    // Fallback: ElevenLabs stop & transcribe
    setRecording(false);
    setTranscribing(true);
    try {
      const blob = await recorderRef.current!.stop();
      if (!blob.size) {
        toast.error(dir === "rtl" ? "لم يتم تسجيل صوت" : "No audio recorded");
        return;
      }
      const text = await transcribeAudio(blob);
      const trimmed = text.trim();
      if (!trimmed) {
        toast.error(dir === "rtl" ? "لم يتم سماع كلام" : "Couldn't hear that — try again");
        return;
      }
      onSend(trimmed);
    } catch (err: any) {
      console.error("Transcription error:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(dir === "rtl" ? `فشل التحويل الصوتي: ${errorMessage}` : `Transcription failed: ${errorMessage}`);
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div className="border-t border-border bg-background" dir={dir}>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto px-4 py-3">
        <div className="relative flex items-end bg-muted rounded-2xl border border-border focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-shadow">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={recording ? (dir === "rtl" ? "جاري التسجيل..." : "Listening...") : t.placeholder}
            disabled={disabled || recording || transcribing}
            rows={1}
            className="flex-1 bg-transparent text-foreground text-sm font-body placeholder:text-muted-foreground focus:outline-none resize-none px-4 py-3 max-h-[200px]"
          />

          <div className="flex items-center gap-1 m-1.5">
            {/* Mic button — always visible like ChatGPT */}
            <button
              type="button"
              onClick={handleMicClick}
              disabled={disabled || transcribing}
              aria-label={recording ? "Stop recording" : "Start recording"}
              className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 ${
                recording
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-secondary hover:bg-secondary/70 text-foreground"
              }`}
            >
              {transcribing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : recording ? (
                <Square className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            <AnimatePresence>
              {input.trim() && !recording && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  type="submit"
                  disabled={disabled}
                  className="flex-shrink-0 w-8 h-8 rounded-xl bg-primary hover:bg-sunrise-bright text-primary-foreground flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <ArrowUp className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground/50 text-center mt-2">
          {dir === "rtl"
            ? "مايند ميت للدعم النفسي فقط وليس بديلاً عن الاستشارة المهنية"
            : "MindMate is for support only and is not a substitute for professional care"}
        </p>
      </form>
    </div>
  );
};

export default ChatInput;
