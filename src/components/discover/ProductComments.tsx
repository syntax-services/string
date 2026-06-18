import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface ProductCommentsProps {
  productId: string;
}

export function ProductComments({ productId }: ProductCommentsProps) {
  const { user, userProfile } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["product-comments", productId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          content,
          created_at,
          rating,
          reviewer_id,
          reviewer_type
        `)
        .eq("product_id", productId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      
      const userIds = [...new Set(data.map(r => r.reviewer_id))];
      if (userIds.length === 0) return [];
      
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url")
        .in("id", userIds);
        
      const profileMap = (profiles || []).reduce((acc: any, p: any) => {
        acc[p.id] = p;
        return acc;
      }, {});

      return data.map(r => ({
        ...r,
        profile: profileMap[r.reviewer_id] || { full_name: "Anonymous User" }
      }));
    },
    enabled: !!productId
  });

  const postCommentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Must be logged in to comment");
      const { error } = await supabase
        .from("reviews")
        .insert({
          product_id: productId,
          content: newComment.trim(),
          rating: 5,
          reviewer_id: user.id,
          reviewer_type: userProfile?.user_type || 'customer',
          verified_purchase: false
        });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["product-comments", productId] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to post comment");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    postCommentMutation.mutate();
  };

  return (
    <div className="flex flex-col space-y-4 mt-6">
      <h3 className="text-sm font-bold text-foreground">Comments ({comments.length})</h3>
      
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-muted-foreground italic">No comments yet. Be the first!</div>
        ) : (
          comments.map((comment: any) => (
            <div key={comment.id} className="flex gap-3 items-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden shrink-0 flex items-center justify-center">
                {comment.profile?.avatar_url ? (
                  <img src={comment.profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-primary" />
                )}
              </div>
              <div className="flex-1 bg-muted/50 rounded-2xl rounded-tl-none p-3 text-sm">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-semibold">{comment.profile?.full_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-foreground/90 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="flex gap-2 items-end pt-2 pb-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="rounded-full bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary"
            disabled={postCommentMutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            className="rounded-full shrink-0" 
            disabled={!newComment.trim() || postCommentMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      ) : (
        <div className="text-sm text-muted-foreground text-center p-3 bg-muted/30 rounded-xl">
          Log in to leave a comment
        </div>
      )}
    </div>
  );
}
