import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Brain, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  index?: number;
}

const ChatMessage = ({ role, content, index = 0 }: ChatMessageProps) => {
  const { dir } = useI18n();
  const isAssistant = role === "assistant";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.15) }}
      className="flex gap-4 group"
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
          isAssistant ? "bg-primary text-primary-foreground" : "bg-sunrise-mid text-primary-foreground"
        }`}
      >
        {isAssistant ? <Brain className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold mb-1 ${isAssistant ? "text-primary" : "text-muted-foreground"}`}>
          {isAssistant ? "MindMate" : dir === "rtl" ? "أنت" : "You"}
        </p>
        <div className={`prose prose-sm max-w-none dark:prose-invert text-foreground ${dir === "rtl" ? "text-right" : ""}`}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
