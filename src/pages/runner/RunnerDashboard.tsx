import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Loader2,
  ChevronRight,
  User,
  MapPin,
  Clock,
  Navigation,
  CheckCircle,
  Package,
  DollarSign,
  ArrowLeft,
  Activity,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";

export default function RunnerDashboard() {
  const { profile, user, refreshProfile, switchRole } = useAuth();
  const navigate = useNavigate();

  // Tab State
  const [activeTab, setActiveTab] = useState<"gigs" | "active" | "earnings">("gigs");

  // Runner Status
  const [isOnline, setIsOnline] = useState(profile?.runner_active || false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Data states
  const [openGigs, setOpenGigs] = useState<any[]>([]);
  const [activeGigs, setActiveGigs] = useState<any[]>([]);
  const [earningsHistory, setEarningsHistory] = useState<any[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [loadingActive, setLoadingActive] = useState(true);
  const [loadingEarnings, setLoadingEarnings] = useState(true);

  // Withdrawal modal
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [submittingWithdraw, setSubmittingWithdraw] = useState(false);

  // Load gigs
  const fetchOpenGigs = async () => {
    setLoadingGigs(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          subtotal,
          delivery_fee,
          total,
          delivery_address,
          notes,
          created_at,
          businesses (
            company_name,
            location
          ),
          delivery_landmark_id
        `)
        .eq("delivery_method", "delivery")
        .in("status", ["confirmed", "processing"])
        .is("runner_id", null);

      if (error) throw error;
      setOpenGigs(data || []);
    } catch (err: any) {
      console.error("Error loading open gigs:", err);
    } finally {
      setLoadingGigs(false);
    }
  };

  const fetchActiveGigs = async () => {
    if (!user) return;
    setLoadingActive(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          subtotal,
          delivery_fee,
          total,
          delivery_address,
          notes,
          delivery_status,
          created_at,
          businesses (
            company_name,
            location
          ),
          customers (
            profiles (
              full_name,
              phone
            )
          )
        `)
        .eq("runner_id", user.id)
        .neq("delivery_status", "delivered");

      if (error) throw error;
      setActiveGigs(data || []);
    } catch (err: any) {
      console.error("Error loading active gigs:", err);
    } finally {
      setLoadingActive(false);
    }
  };

  const fetchEarningsHistory = async () => {
    if (!user) return;
    setLoadingEarnings(true);
    try {
      const [wdsRes, completedOrdsRes] = await Promise.all([
        supabase
          .from("withdrawal_requests")
          .select("*")
          .eq("user_id", user.id)
          .eq("withdrawal_type", "runner")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select(`
            id,
            order_number,
            delivery_fee,
            delivered_at
          `)
          .eq("runner_id", user.id)
          .eq("delivery_status", "delivered")
          .order("delivered_at", { ascending: false })
      ]);

      if (wdsRes.error) throw wdsRes.error;
      if (completedOrdsRes.error) throw completedOrdsRes.error;

      // Map combined list
      const combined = [
        ...(wdsRes.data || []).map((w: any) => ({
          id: w.id,
          type: "withdrawal",
          amount: w.amount,
          status: w.status,
          date: w.created_at,
          title: `Withdrawal (${w.bank_name})`
        })),
        ...(completedOrdsRes.data || []).map((o: any) => ({
          id: o.id,
          type: "delivery",
          amount: Number(o.delivery_fee),
          status: "completed",
          date: o.delivered_at || new Date().toISOString(),
          title: `Delivery Fee - ${o.order_number}`
        }))
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setEarningsHistory(combined);
    } catch (err: any) {
      console.error("Error loading earnings:", err);
    } finally {
      setLoadingEarnings(false);
    }
  };

  // Toggle online status
  const handleToggleOnline = async () => {
    if (!user) return;
    setUpdatingStatus(true);
    const nextStatus = !isOnline;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ runner_active: nextStatus })
        .eq("user_id", user.id);

      if (error) throw error;
      setIsOnline(nextStatus);
      toast.success(nextStatus ? "You are now online! ⚡ Ready for gigs." : "You are now offline.");
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Claim Gig
  const handleClaimGig = async (orderId: string) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.rpc("accept_delivery_gig", {
        p_order_id: orderId,
        p_runner_id: user.id
      });

      if (error) throw error;

      if (data) {
        toast.success("Gig successfully claimed! Check Active Gigs. 📦");
        fetchOpenGigs();
      } else {
        toast.error("Could not claim gig. It may have been claimed by another runner.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to claim gig");
    }
  };

  // Update delivery status
  const handleUpdateStatus = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === "accepted" ? "picked_up" : "delivered";
    try {
      if (nextStatus === "delivered") {
        const { data, error } = await supabase.rpc("complete_delivery_gig", {
          p_order_id: orderId,
          p_runner_id: user?.id
        });

        if (error) throw error;
        if (data) {
          toast.success("Delivery completed! Earnings credited to wallet. 💰");
          fetchActiveGigs();
          await refreshProfile();
        } else {
          toast.error("Failed to complete delivery.");
        }
      } else {
        const { error } = await supabase
          .from("orders")
          .update({ delivery_status: nextStatus })
          .eq("id", orderId);

        if (error) throw error;
        toast.success("Package marked as Picked Up!");
        fetchActiveGigs();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update delivery status");
    }
  };

  // Withdrawal Request
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const amount = Number(withdrawAmount);
    const balance = Number(profile?.runner_balance || 0);

    if (!amount || amount < 1000) {
      toast.error("Minimum withdrawal is ₦1,000");
      return;
    }
    if (amount > balance) {
      toast.error("Insufficient runner wallet balance");
      return;
    }
    if (!bankName || !accountNumber || !accountName) {
      toast.error("Please fill in all bank details.");
      return;
    }

    setSubmittingWithdraw(true);
    try {
      // 1. Insert withdrawal request
      const { data: withdrawReq, error: insertError } = await supabase
        .from("withdrawal_requests")
        .insert({
          user_id: user.id,
          amount: amount,
          bank_name: bankName,
          account_number: accountNumber,
          account_name: accountName,
          withdrawal_type: "runner",
          status: "pending"
        })
        .select("*")
        .single();

      if (insertError) throw insertError;

      // 2. Deduct amount from runner_balance
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ runner_balance: balance - amount })
        .eq("user_id", user.id);

      if (profileError) throw profileError;

      // 3. Trigger payout edge function (optional)
      try {
        await supabase.functions.invoke("paystack-payout", {
          body: { withdrawalRequestId: withdrawReq.id }
        });
      } catch (fErr) {
        console.warn("Edge function payout call failed:", fErr);
      }

      toast.success(`Withdrawal request for ₦${amount.toLocaleString()} submitted successfully!`);
      setWithdrawAmount("");
      setBankName("");
      setAccountNumber("");
      setAccountName("");
      setIsWithdrawModalOpen(false);

      await refreshProfile();
      fetchEarningsHistory();
    } catch (err: any) {
      toast.error(err.message || "Failed to process withdrawal");
    } finally {
      setSubmittingWithdraw(false);
    }
  };

  // Switch back to shopper view
  const handleExitRunnerView = async () => {
    await switchRole("customer");
    navigate("/customer/profile");
  };

  useEffect(() => {
    fetchOpenGigs();
  }, []);

  useEffect(() => {
    if (activeTab === "gigs") fetchOpenGigs();
    if (activeTab === "active") fetchActiveGigs();
    if (activeTab === "earnings") fetchEarningsHistory();
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-muted/30 pb-20">
      {/* Header Banner */}
      <div className="bg-card border-b border-border/10 py-4 px-4 sticky top-0 z-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleExitRunnerView}
            className="rounded-full hover:bg-muted/80 text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base font-black tracking-tight text-foreground flex items-center gap-1.5">
              Runner Dashboard <span className="text-emerald-500">⚡</span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">OOU Courier Network</p>
          </div>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            {isOnline ? "Online" : "Offline"}
          </span>
          <button
            onClick={handleToggleOnline}
            disabled={updatingStatus}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 ${
              isOnline ? "bg-emerald-500" : "bg-muted-foreground/30"
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                isOnline ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 mt-5 space-y-5">
        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 shadow-md">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Runner Wallet Balance</span>
              <p className="text-2xl font-black text-foreground font-mono tracking-tight">
                ₦{Number(profile?.runner_balance || 0).toLocaleString()}
              </p>
            </div>
            <Button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
            >
              <CreditCard className="h-4 w-4 mr-1.5" />
              Cash Out
            </Button>
          </CardContent>
        </Card>

        {/* Navigation Tabs */}
        <div className="flex bg-muted p-1 rounded-2xl border border-border/10">
          {(["gigs", "active", "earnings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 uppercase tracking-wider ${
                activeTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "gigs" ? "Gig Board" : tab === "active" ? "Active Deliveries" : "Earnings"}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === "gigs" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-muted-foreground uppercase">Available Delivery Gigs ({openGigs.length})</span>
              <Button variant="ghost" size="sm" onClick={fetchOpenGigs} className="text-[10px] h-6 px-2 text-primary font-bold">
                Refresh Board
              </Button>
            </div>

            {loadingGigs ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : openGigs.length === 0 ? (
              <Card className="border border-border/40 p-8 text-center bg-card">
                <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-bold text-muted-foreground">No delivery gigs available right now.</p>
                <p className="text-xs text-muted-foreground mt-1">Check back soon or refresh the board.</p>
              </Card>
            ) : (
              openGigs.map((gig) => (
                <Card key={gig.id} className="border border-border/40 hover:border-primary/20 transition-all bg-card shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{gig.businesses?.company_name || "Merchant Shop"}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Order: {gig.order_number}</p>
                      </div>
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 font-mono font-bold text-xs">
                        +₦{Number(gig.delivery_fee).toLocaleString()}
                      </Badge>
                    </div>

                    <div className="space-y-2 border-t border-b border-border/10 py-2 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground/80">Pick up from:</p>
                          <p className="text-muted-foreground">{gig.businesses?.location || "Merchant Address"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground/80">Deliver to:</p>
                          <p className="text-muted-foreground">{gig.delivery_address || "Landmark Location"}</p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleClaimGig(gig.id)}
                      disabled={!isOnline}
                      className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-xs h-9 rounded-xl shadow-md transition-all duration-300"
                    >
                      {isOnline ? "Accept Delivery Gig" : "Go Online to Claim Gig"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "active" && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Your Claims ({activeGigs.length})</span>

            {loadingActive ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : activeGigs.length === 0 ? (
              <Card className="border border-border/40 p-8 text-center bg-card">
                <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-bold text-muted-foreground">You have no active deliveries.</p>
                <p className="text-xs text-muted-foreground mt-1">Accept gigs from the Gig Board to start earning.</p>
              </Card>
            ) : (
              activeGigs.map((gig) => (
                <Card key={gig.id} className="border border-border/40 bg-card shadow-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{gig.businesses?.company_name || "Merchant Shop"}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Order: {gig.order_number}</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary capitalize text-[10px] font-bold">
                        Status: {gig.delivery_status || "accepted"}
                      </Badge>
                    </div>

                    <div className="space-y-2 border-t border-b border-border/10 py-2 text-xs">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground/80">Pick up from:</p>
                          <p className="text-muted-foreground">{gig.businesses?.location || "Merchant Address"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground/80">Deliver to:</p>
                          <p className="text-muted-foreground">{gig.delivery_address || "Landmark Location"}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground/80">Customer Info:</p>
                          <p className="text-muted-foreground">
                            {gig.customers?.profiles?.full_name || "Friend"} - {gig.customers?.profiles?.phone || "No phone"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleUpdateStatus(gig.id, gig.delivery_status || "accepted")}
                      className={`w-full font-bold text-xs h-9 rounded-xl shadow-md transition-all duration-300 ${
                        gig.delivery_status === "accepted"
                          ? "bg-amber-500 hover:bg-amber-600 text-white"
                          : "bg-emerald-500 hover:bg-emerald-600 text-white"
                      }`}
                    >
                      {gig.delivery_status === "accepted" ? "Confirm Package Picked Up" : "Confirm Package Delivered"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "earnings" && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Earning logs & Withdrawals</span>

            {loadingEarnings ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : earningsHistory.length === 0 ? (
              <Card className="border border-border/40 p-8 text-center bg-card">
                <Activity className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-bold text-muted-foreground">No earnings history found.</p>
                <p className="text-xs text-muted-foreground mt-1">Complete deliveries to see transaction details.</p>
              </Card>
            ) : (
              <div className="bg-card rounded-2xl border border-border/40 shadow-sm overflow-hidden divide-y divide-border/10">
                {earningsHistory.map((log) => (
                  <div key={log.id} className="p-3 flex items-center justify-between text-xs">
                    <div className="space-y-0.5 text-left">
                      <p className="font-semibold text-foreground/80">{log.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {format(new Date(log.date), "MMM d, yyyy - h:mm a")}
                      </p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className={`font-mono font-bold ${log.type === "withdrawal" ? "text-red-500" : "text-emerald-500"}`}>
                        {log.type === "withdrawal" ? "-" : "+"}₦{log.amount.toLocaleString()}
                      </p>
                      <Badge
                        variant="secondary"
                        className={`text-[8px] font-bold scale-90 ${
                          log.status === "completed" || log.status === "approved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : log.status === "pending"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-red-500/10 text-red-600"
                        }`}
                      >
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Withdrawal Dialog */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <DialogContent className="max-w-xs rounded-2xl border-border/30 bg-card p-5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-black tracking-tight text-foreground flex items-center gap-1">
              Request Cash Out <span className="text-emerald-500">💰</span>
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground leading-tight">
              Transfer your courier delivery fee earnings directly to your bank account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleWithdrawalRequest} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label htmlFor="amount" className="text-[10px] font-bold text-muted-foreground uppercase">Amount (₦)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="1000"
                min="1000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="h-9 rounded-xl border-border/20 bg-muted/30 text-xs font-semibold focus-visible:ring-emerald-500"
                required
              />
              <span className="text-[9px] text-muted-foreground">Min. withdrawal: ₦1,000</span>
            </div>

            <div className="space-y-1">
              <Label htmlFor="bank" className="text-[10px] font-bold text-muted-foreground uppercase">Bank Name</Label>
              <Input
                id="bank"
                type="text"
                placeholder="e.g. Access Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="h-9 rounded-xl border-border/20 bg-muted/30 text-xs font-semibold focus-visible:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="acc-num" className="text-[10px] font-bold text-muted-foreground uppercase">Account Number</Label>
              <Input
                id="acc-num"
                type="text"
                maxLength={10}
                placeholder="10-digit number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                className="h-9 rounded-xl border-border/20 bg-muted/30 text-xs font-semibold font-mono focus-visible:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="acc-name" className="text-[10px] font-bold text-muted-foreground uppercase">Account Name</Label>
              <Input
                id="acc-name"
                type="text"
                placeholder="e.g. John Doe"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="h-9 rounded-xl border-border/20 bg-muted/30 text-xs font-semibold focus-visible:ring-emerald-500"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                disabled={submittingWithdraw || !withdrawAmount || !bankName || !accountNumber || !accountName}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
              >
                {submittingWithdraw ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  "Confirm Cash Out"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
