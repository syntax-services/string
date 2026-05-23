import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReferralData {
  code: string | null;
  totalReferrals: number;
  totalPoints: number;
  referralPoints: number;
}

export function useReferral() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["referral-data", user?.id],
    queryFn: async (): Promise<ReferralData> => {
      if (!user) return { code: null, totalReferrals: 0, totalPoints: 0, referralPoints: 0 };

      const [codeRes, referralsRes, pointsRes] = await Promise.all([
        supabase
          .from("referral_codes")
          .select("code")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase
          .from("referrals")
          .select("id", { count: "exact", head: true })
          .eq("referrer_id", user.id)
          .eq("status", "completed"),
        supabase
          .from("user_points")
          .select("total_points, referral_points")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      return {
        code: codeRes.data?.code || null,
        totalReferrals: referralsRes.count || 0,
        totalPoints: pointsRes.data?.total_points || 0,
        referralPoints: pointsRes.data?.referral_points || 0,
      };
    },
    enabled: !!user,
  });

  return {
    referralCode: data?.code || null,
    totalReferrals: data?.totalReferrals || 0,
    totalPoints: data?.totalPoints || 0,
    referralPoints: data?.referralPoints || 0,
    isLoading,
  };
}
