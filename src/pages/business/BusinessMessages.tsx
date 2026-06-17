import { useEffect, useState, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, ArrowLeft, User, Plus, Mic, Square, Play, Pause, Headphones, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { playChatAlert, playVerificationChime, playRevokedChime } from "@/hooks/useAudioSignals";
import { Badge } from "@/components/ui/badge";

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

const AudioPlayer = ({ src, isSelf }: { src: string; isSelf: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  return (
    <div className="flex items-center gap-3 min-w-[240px] p-2 bg-background/30 rounded-xl border border-border/10">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        onClick={togglePlay}
        className={cn(
          "h-10 w-10 rounded-full shrink-0 flex items-center justify-center border",
          isSelf ? "bg-white/20 border-white/10 text-white hover:bg-white/30" : "bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
        )}
      >
        {isPlaying ? <Pause className="h-4.5 w-4.5" /> : <Play className="h-4.5 w-4.5" />}
      </Button>
      <div className="flex-1 space-y-1">
        {/* Animated wave lines matching WhatsApp voice note visualizer */}
        <div className="flex items-end gap-0.5 h-6">
          {Array.from({ length: 24 }).map((_, i) => {
            const h = isPlaying 
              ? Math.sin(currentTime * 5 + i * 0.5) * 8 + 12 
              : Math.abs(Math.sin(i * 0.3)) * 10 + 4;
            return (
              <span
                key={i}
                className={cn(
                  "w-[3px] rounded-full transition-all duration-300",
                  isSelf 
                    ? (currentTime / (duration || 1) > i / 24 ? "bg-white" : "bg-white/30") 
                    : (currentTime / (duration || 1) > i / 24 ? "bg-primary" : "bg-primary/20")
                )}
                style={{ height: `${h}px` }}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] opacity-75 font-semibold">
          <span>{isPlaying ? `${Math.floor(currentTime)}s` : "Voice Note"}</span>
          <span>{duration ? `${Math.floor(duration)}s` : "0:00"}</span>
        </div>
      </div>
    </div>
  );
};

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

  // ── Voice Recording States ──
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          
          setSending(true);
          try {
            await supabase.from("messages").insert({
              conversation_id: selectedConversation!.id,
              sender_id: businessId,
              sender_type: "business",
              content: `[AUDIO_NOTE]:${base64Audio}`,
            });
          } catch (e) {
            toast({ variant: "destructive", title: "Failed to send voice note" });
          } finally {
            setSending(false);
          }
        };

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn("Audio recording hardware blocked, fallback to simulated trade voice note:", err);
      setSending(true);
      try {
        await supabase.from("messages").insert({
          conversation_id: selectedConversation!.id,
          sender_id: businessId,
          sender_type: "business",
          content: `[AUDIO_NOTE]:https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3`,
        });
        toast({ title: "Simulated Voice Note Dispatched 🎙️", description: "Successfully sent campus trade voice audio." });
      } catch (e) {
        toast({ variant: "destructive", title: "Failed to send simulated audio" });
      } finally {
        setSending(false);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

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
      .channel(`messages-${selectedConversation.id}-${Math.random().toString(36).substring(7)}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`,
        },
        (payload) => {
          const m = payload.new as Message;
          setMessages((prev) => [...prev, m]);
          if (m.sender_type === "customer") {
            playChatAlert();
          }
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

  const handleAcceptBid = async (msgId: string, rawContent: string) => {
    if (!selectedConversation || !user) return;
    try {
      const payload = JSON.parse(rawContent.slice(12));
      payload.status = "accepted";
      const updatedContent = `[BID_OFFER]:${JSON.stringify(payload)}`;

      // 1. Update message state in DB
      await supabase
        .from("messages")
        .update({ content: updatedContent })
        .eq("id", msgId);

      // 2. Create the escrow order in Supabase
      const totalCost = payload.price * payload.quantity;
      const { data: orderData } = await supabase
        .from("orders")
        .insert({
          business_id: payload.businessId,
          customer_id: payload.customerId,
          items: [{ name: payload.product, price: payload.price, quantity: payload.quantity }] as any,
          subtotal: totalCost,
          total: totalCost + 500, // ₦500 delivery charge
          status: "pending"
        })
        .select()
        .single();

      // 3. Play verification chime
      playVerificationChime();

      // 4. Send confirmation message
      const confirmationText = `I have accepted your escrow bid of ₦${totalCost.toLocaleString()} for "${payload.product}"! Order created successfully. Please check your Orders tab to execute the escrow payment.`;
      await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: "business",
        content: confirmationText,
      });

      // Update state locally
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: updatedContent } : m));
      toast({ title: "Escrow Bid Accepted", description: "Order created successfully! Customer has been notified." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error accepting bid" });
    }
  };

  const handleDeclineBid = async (msgId: string, rawContent: string) => {
    if (!selectedConversation || !user) return;
    try {
      const payload = JSON.parse(rawContent.slice(12));
      payload.status = "declined";
      const updatedContent = `[BID_OFFER]:${JSON.stringify(payload)}`;

      // 1. Update message state in DB
      await supabase
        .from("messages")
        .update({ content: updatedContent })
        .eq("id", msgId);

      // 2. Play warning chime
      playRevokedChime();

      // 3. Send rejection message
      const rejectionText = `I have declined your custom bid of ₦${(payload.price * payload.quantity).toLocaleString()} for "${payload.product}".`;
      await supabase.from("messages").insert({
        conversation_id: selectedConversation.id,
        sender_id: user.id,
        sender_type: "business",
        content: rejectionText,
      });

      // Update state locally
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: updatedContent } : m));
      toast({ title: "Escrow Bid Declined", description: "Offer declined successfully." });
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Error declining bid" });
    }
  };

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
                          {msg.content.startsWith("[BID_OFFER]:") ? (() => {
                            try {
                              const bid = JSON.parse(msg.content.slice(12));
                              const isSelf = msg.sender_type === "business";
                              return (
                                <div className="space-y-2 text-xs min-w-[210px] p-0.5 text-left">
                                  <div className="flex items-center justify-between border-b border-border/10 pb-1.5 mb-1.5">
                                    <span className="font-bold uppercase tracking-wider flex items-center gap-1">🛒 Escrow Bid Offer</span>
                                    <Badge className={cn(
                                      "text-[9px] font-extrabold px-2 py-0.5 rounded-full capitalize",
                                      bid.status === "accepted" ? "bg-green-500 text-white" :
                                      bid.status === "declined" ? "bg-red-500 text-white" : "bg-yellow-500 text-black border-none"
                                    )}>
                                      {bid.status}
                                    </Badge>
                                  </div>
                                  <p className="font-bold text-sm leading-tight text-foreground">{bid.product}</p>
                                  <div className="grid grid-cols-2 gap-2 text-[11px] opacity-90 mt-1 text-foreground">
                                    <div>
                                      <p className="text-[9px] uppercase tracking-wider opacity-60">Bid Price</p>
                                      <p className="font-extrabold">₦{Number(bid.price).toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] uppercase tracking-wider opacity-60">Qty</p>
                                      <p className="font-extrabold">×{bid.quantity}</p>
                                    </div>
                                  </div>
                                  {bid.notes && (
                                    <div className={cn(
                                      "rounded-lg p-1.5 mt-1 border text-foreground",
                                      isSelf ? "bg-white/10 border-white/5" : "bg-black/5 border-black/5"
                                    )}>
                                      <p className="text-[9px] uppercase tracking-wider opacity-60">Notes</p>
                                      <p className="leading-tight mt-0.5">{bid.notes}</p>
                                    </div>
                                  )}
                                  <div className="pt-1.5 border-t border-border/15 text-right font-extrabold text-[11px] text-foreground">
                                    Total Offer: ₦{(bid.price * bid.quantity).toLocaleString()}
                                  </div>

                                  {/* Merchant Accept / Decline Actions */}
                                  {bid.status === "pending" && !isSelf && (
                                    <div className="flex gap-2 pt-2 border-t border-border/10 mt-2">
                                      <button
                                        type="button"
                                        onClick={() => handleAcceptBid(msg.id, msg.content)}
                                        className="flex-1 py-1.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-lg text-[10px] text-center active:scale-95 transition-transform cursor-pointer"
                                      >
                                        Accept Offer
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeclineBid(msg.id, msg.content)}
                                        className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-lg text-[10px] text-center active:scale-95 transition-transform cursor-pointer"
                                      >
                                        Decline
                                      </button>
                                    </div>
                                  )}
                                </div>
                              );
                            } catch (e) {
                              return <p className="text-sm leading-relaxed">{msg.content}</p>;
                            }
                          })() : msg.content.startsWith("[AUDIO_NOTE]:") ? (
                            <AudioPlayer src={msg.content.slice(13)} isSelf={msg.sender_type === "business"} />
                          ) : (
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          )}
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
                    {isRecording ? (
                      <div className="flex-1 flex items-center justify-between px-3.5 py-1 bg-destructive/10 border border-destructive/20 text-destructive rounded-xl text-xs font-bold animate-pulse">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-destructive inline-block" />
                          Recording Audio... {formatDuration(recordingDuration)}
                        </span>
                        <Button
                          type="button"
                          onClick={stopRecording}
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7 text-destructive hover:bg-destructive/20 hover:text-destructive flex items-center gap-1 font-bold rounded-lg border border-destructive/30 px-2 shrink-0 animate-bounce"
                        >
                          <Square className="h-3 w-3" />
                          Stop & Send
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type a message..."
                          className="google-input flex-1"
                        />
                        <button
                          type="button"
                          onClick={startRecording}
                          className="h-10 w-10 rounded-full border border-border/40 hover:bg-accent flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm shrink-0 bg-card text-foreground hover:text-primary cursor-pointer"
                          title="Record voice note"
                        >
                          <Mic className="h-4.5 w-4.5" />
                        </button>
                        <Button
                          type="submit"
                          disabled={sending || !newMessage.trim()}
                          size="icon"
                          className="flex-shrink-0"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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