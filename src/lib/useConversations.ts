import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Conversation } from "@/pages/Index";

type DBMessage = { id: string; role: "user" | "assistant"; content: string };

export function useConversations(userId: string | null) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  // Initial load
  useEffect(() => {
    if (!userId) {
      setConversations([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: convs, error } = await supabase
        .from("conversations")
        .select("id,title,created_at")
        .order("updated_at", { ascending: false });
      if (error || !convs) {
        setLoading(false);
        return;
      }
      const ids = convs.map((c) => c.id);
      let messagesByConv: Record<string, DBMessage[]> = {};
      if (ids.length) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("id,conversation_id,role,content,created_at")
          .in("conversation_id", ids)
          .order("created_at", { ascending: true });
        messagesByConv = (msgs || []).reduce<Record<string, DBMessage[]>>((acc, m) => {
          (acc[m.conversation_id] ||= []).push({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          });
          return acc;
        }, {});
      }
      if (cancelled) return;
      setConversations(
        convs.map((c) => ({
          id: c.id,
          title: c.title,
          messages: messagesByConv[c.id] || [],
          createdAt: new Date(c.created_at),
        }))
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const ensureConversation = useCallback(
    async (convId: string, title: string): Promise<string | null> => {
      if (!userId) return null;
      // Upsert: try select, if missing insert
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("id", convId)
        .maybeSingle();
      if (existing) {
        await supabase.from("conversations").update({ title }).eq("id", convId);
        return existing.id;
      }
      const { data, error } = await supabase
        .from("conversations")
        .insert({ id: convId, user_id: userId, title })
        .select("id")
        .single();
      if (error) return null;
      return data.id;
    },
    [userId]
  );

  const saveMessage = useCallback(
    async (conversationId: string, role: "user" | "assistant", content: string, id?: string) => {
      if (!userId) return;
      const payload: { conversation_id: string; user_id: string; role: string; content: string; id?: string } = {
        conversation_id: conversationId,
        user_id: userId,
        role,
        content,
      };
      if (id) payload.id = id;
      await supabase.from("messages").insert(payload);
    },
    [userId]
  );

  const deleteConversation = useCallback(
    async (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      await supabase.from("conversations").delete().eq("id", id);
    },
    []
  );

  const upsertLocal = useCallback((conv: Conversation) => {
    setConversations((prev) => {
      const exists = prev.find((c) => c.id === conv.id);
      if (exists) return prev.map((c) => (c.id === conv.id ? conv : c));
      return [conv, ...prev];
    });
  }, []);

  return { conversations, loading, ensureConversation, saveMessage, deleteConversation, upsertLocal };
}
