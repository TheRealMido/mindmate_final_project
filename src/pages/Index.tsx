import { useEffect, useState, useCallback } from "react";
import { I18nProvider } from "@/lib/i18n";
import ChatSidebar from "@/components/ChatSidebar";
import ChatPanel from "@/components/ChatPanel";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useCompanion } from "@/lib/companion";
import { supabase } from "@/integrations/supabase/client";
import { useConversations } from "@/lib/useConversations";

export interface Conversation {
  id: string;
  title: string;
  messages: { id: string; role: "user" | "assistant"; content: string }[];
  createdAt: Date;
}

const Index = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const companionHook = useCompanion();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const {
    conversations,
    ensureConversation,
    saveMessage,
    deleteConversation,
    upsertLocal,
  } = useConversations(userId);

  const activeConversation = conversations.find((c) => c.id === activeId) || null;

  const handleNewChat = useCallback(() => setActiveId(null), []);
  const handleSelectConversation = useCallback((id: string) => setActiveId(id), []);

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      await deleteConversation(id);
      if (activeId === id) setActiveId(null);
    },
    [activeId, deleteConversation]
  );

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <I18nProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background">
          <ChatSidebar
            conversations={conversations}
            activeId={activeId}
            onNewChat={handleNewChat}
            onSelect={handleSelectConversation}
            onDelete={handleDeleteConversation}
            onSignOut={handleSignOut}
            companion={companionHook}
          />
          <ChatPanel
            conversation={activeConversation}
            companion={companionHook}
            onLocalUpdate={(conv) => {
              upsertLocal(conv);
              setActiveId(conv.id);
            }}
            ensureConversation={ensureConversation}
            saveMessage={saveMessage}
          />
        </div>
      </SidebarProvider>
    </I18nProvider>
  );
};

export default Index;
