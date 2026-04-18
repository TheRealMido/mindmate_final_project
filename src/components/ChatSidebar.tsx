import { Plus, MessageSquare, Trash2, Mic, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import SOSButton from "./SOSButton";
import CompanionPanel from "./CompanionPanel";
import CompanionAvatar from "./CompanionAvatar";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import LanguageToggle from "./LanguageToggle";
import type { Conversation } from "@/pages/Index";
import type { useCompanion } from "@/lib/companion";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onNewChat: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onSignOut?: () => void;
  companion: ReturnType<typeof useCompanion>;
}

const ChatSidebar = ({ conversations, activeId, onNewChat, onSelect, onDelete, onSignOut, companion }: ChatSidebarProps) => {
  const { t, dir } = useI18n();

  return (
    <Sidebar collapsible="icon" className="border-e border-border" style={{ direction: dir }}>
      <SidebarHeader className="p-3">
        <Button
          onClick={onNewChat}
          variant="outline"
          className="w-full justify-start gap-2 rounded-xl border-border hover:bg-secondary"
        >
          <Plus className="w-4 h-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            {dir === "rtl" ? "محادثة جديدة" : "New Chat"}
          </span>
        </Button>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* Companion Panel */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="group-data-[collapsible=icon]:hidden">
              <CompanionPanel
                companion={companion.companion}
                onSetName={companion.setName}
                onSetAppearance={companion.setAppearance}
              />
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex justify-center py-2">
              <CompanionAvatar
                name={companion.companion.name}
                mood={companion.companion.mood}
                appearance={companion.companion.appearance}
                level={companion.companion.level}
                size="sm"
                showLabel={false}
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Conversations */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <AnimatePresence>
                {conversations.map((conv) => (
                  <motion.div
                    key={conv.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        onClick={() => onSelect(conv.id)}
                        className={`group/item rounded-xl transition-colors ${
                          activeId === conv.id ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate flex-1 group-data-[collapsible=icon]:hidden text-sm">
                          {conv.title}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(conv.id);
                          }}
                          className="opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0 p-1 rounded hover:bg-destructive/10 hover:text-destructive group-data-[collapsible=icon]:hidden"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </motion.div>
                ))}
              </AnimatePresence>

              {conversations.length === 0 && (
                <div className="px-3 py-4 text-center group-data-[collapsible=icon]:hidden">
                  <MessageSquare className="w-6 h-6 text-muted-foreground/30 mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground/50">
                    {dir === "rtl" ? "لا توجد محادثات بعد" : "No conversations yet"}
                  </p>
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-border space-y-3">
        <Link to="/companion" className="group-data-[collapsible=icon]:hidden">
          <Button variant="outline" className="w-full justify-start gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/10">
            <Mic className="w-4 h-4" />
            {dir === "rtl" ? "تحدث مع رفيقك" : "Talk to Companion"}
          </Button>
        </Link>
        <SOSButton />
        {onSignOut && (
          <Button
            onClick={onSignOut}
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground group-data-[collapsible=icon]:hidden"
          >
            <LogOut className="w-4 h-4" />
            {dir === "rtl" ? "تسجيل الخروج" : "Sign out"}
          </Button>
        )}
        <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
          <div className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="text-sm font-heading font-semibold text-foreground truncate">{t.appName}</p>
            <p className="text-[10px] text-muted-foreground">{t.subtitle}</p>
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <LanguageToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default ChatSidebar;
