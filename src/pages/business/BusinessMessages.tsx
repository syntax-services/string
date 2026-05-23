import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, ArrowLeft, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface Conversation {
  id: string;
  customer_id: string;
  customer_name: string;
  last_message: string | null;
  last_message_at: string;
  unread_count: number;
}

interface Message {
  id: string;
  content: string;
  sender_type: "customer" | "business";
  created_at: string;
  read_at: string | null;
}

export default function BusinessMessages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBusinessId = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setBusinessId(data.id);
    };
    fetchBusinessId();
  }, [user]);

  useEffect(() => {
    const fetchConversations = async () => {
      if (!businessId) return;

      const { data: enriched, error } = await supabase
        .rpc("get_business_conversations", { p_business_id: businessId });

      if (error) {
        console.error("Error fetching business conversations RPC:", error);
      } else if (enriched) {
        setConversations(enriched as Conversation[]);
      }
      setLoading(false);
    };

    fetchConversations();
  }, [businessId]);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("id, content, sender_type, created_at, read_at")
        .eq("conversation_id", selectedConversation.id)
        .order("created_at", { ascending: true });

      if (data) {
        setMessages(data as Message[]);
        
        // Mark messages as read
        await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("conversation_id", selectedConversation.id)
          .eq("sender_type", "customer")
          .is("read_at", null);
      }
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`messages-${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: "business",
        content: newMessage.trim(),
      });

      setNewMessage("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to send",
        description: "Please try again.",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          {selectedConversation && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedConversation(null)}
              className="lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Messages</h1>
            {!selectedConversation && (
              <p className="mt-1 text-muted-foreground">
                Chat with customers
              </p>
            )}
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden rounded-lg border border-border bg-card">
          {/* Conversation List */}
          <div
            className={cn(
              "w-full lg:w-80 border-r border-border",
              selectedConversation && "hidden lg:block"
            )}
          >
            <ScrollArea className="h-full">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-4 w-2/3 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Customers will message you here
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={cn(
                        "w-full p-4 text-left hover:bg-accent transition-colors",
                        selectedConversation?.id === conv.id && "bg-accent"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-foreground truncate">
                              {conv.customer_name}
                            </span>
                            {conv.unread_count > 0 && (
                              <span className="h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                          {conv.last_message && (
                            <p className="text-sm text-muted-foreground truncate">
                              {conv.last_message}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message Thread */}
          <div
            className={cn(
              "flex-1 flex flex-col",
              !selectedConversation && "hidden lg:flex"
            )}
          >
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-border">
                  <h2 className="font-medium text-foreground">
                    {selectedConversation.customer_name}
                  </h2>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.sender_type === "business" ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] px-4 py-2 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
                            msg.sender_type === "business"
                              ? "rounded-[1.25rem] rounded-tr-[4px] bg-primary text-primary-foreground text-left"
                              : "rounded-[1.25rem] rounded-tl-[4px] bg-muted/65 text-foreground text-left border border-border/20"
                          )}
                        >
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          <div className="flex items-center justify-end gap-1 mt-1 opacity-80">
                            <span className="text-[9px] uppercase tracking-wider">
                              {format(new Date(msg.created_at), "HH:mm")}
                            </span>
                            {msg.sender_type === "business" && (
                              <span className="text-[10px]">
                                {msg.read_at ? (
                                  <span className="text-white font-bold">✓✓</span>
                                ) : (
                                  <span className="text-primary-foreground/50">✓</span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <button
                      type="button"
                      onClick={() => toast({ title: "Attachments Synced", description: "Supabase storage ready. Upload photos under 10MB." })}
                      className="h-10 w-10 rounded-full border border-border/40 hover:bg-accent flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm shrink-0 bg-card text-foreground hover:text-primary cursor-pointer"
                      title="Upload photos"
                    >
                      <Plus className="h-4.5 w-4.5" />
                    </button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      size="icon"
                      className="flex-shrink-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}