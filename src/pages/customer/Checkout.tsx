import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Truck, Store, ShieldCheck, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculateDeliveryFee, OOU_ZONE_NAMES, OouZone } from "@/lib/deliveryCalculator";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("business");
  const { user, profile } = useAuth();
  const { cartByBusiness, isLoading } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [deliveryType, setDeliveryType] = useState<"standard" | "pickup">("standard");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [processing, setProcessing] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>("UNKNOWN");

  // Determine what businesses we are checkouting from
  const businessesToCheckout = useMemo(() => {
    if (businessId && cartByBusiness[businessId]) {
      return { [businessId]: cartByBusiness[businessId] };
    }
    return cartByBusiness;
  }, [businessId, cartByBusiness]);

  const hasItems = Object.keys(businessesToCheckout).length > 0;

  // Query location data for the checkouting businesses
  const { data: checkoutBusinesses } = useQuery({
    queryKey: ["checkout-businesses", Object.keys(businessesToCheckout)],
    queryFn: async () => {
      const bizIds = Object.keys(businessesToCheckout);
      if (bizIds.length === 0) return [];
      const { data, error } = await supabase
        .from("businesses")
        .select("id, company_name, business_location, latitude, longitude, location_verified")
        .in("id", bizIds);
      if (error) throw error;
      return data || [];
    },
    enabled: hasItems
  });

  const [completedOrdersCount, setCompletedOrdersCount] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchCompletedOrders = async () => {
      try {
        const { data: customerData } = await supabase
          .from("customers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (customerData) {
          const { count, error } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("customer_id", customerData.id)
            .eq("status", "completed");

          if (!error && count !== null) {
            setCompletedOrdersCount(count);
          }
        }
      } catch (err) {
        console.error("Error fetching completed orders count:", err);
      }
    };

    fetchCompletedOrders();
  }, [user]);

  const hasIdicDiscount = 
    !!((profile?.idic_code || profile?.user_type === "admin") && 
    completedOrdersCount !== null && 
    completedOrdersCount < 5);

  const subtotal = useMemo(() => {
    return Object.values(businessesToCheckout).reduce((sum, data) => sum + data.total, 0);
  }, [businessesToCheckout]);

  const discountAmount = hasIdicDiscount ? Math.round(subtotal * 0.1) : 0;

  // Calculate delivery fee for each store to the selected landmark/address
  const computedDeliveryFees = useMemo(() => {
    const fees: Record<string, number> = {};
    if (deliveryType !== "standard" || !checkoutBusinesses) return fees;
    
    const targetAddress = address.trim() || OOU_ZONE_NAMES[selectedZone as OouZone] || "";
    if (!targetAddress) return fees;
    
    checkoutBusinesses.forEach(biz => {
      fees[biz.id] = calculateDeliveryFee(biz.business_location || "", targetAddress);
    });
    return fees;
  }, [deliveryType, checkoutBusinesses, address, selectedZone]);

  const deliveryFee = useMemo(() => {
    if (deliveryType !== "standard") return 0;
    return Object.values(computedDeliveryFees).reduce((sum, fee) => sum + fee, 0);
  }, [deliveryType, computedDeliveryFees]);

  const total = subtotal + deliveryFee - discountAmount;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!hasItems) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-20 text-center space-y-4">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <Button onClick={() => navigate("/customer/discover")}>Go back to shopping</Button>
        </div>
      </DashboardLayout>
    );
  }

  const handlePayment = async () => {
    if (deliveryType === "standard" && !address.trim() && selectedZone === "UNKNOWN") {
      toast({ variant: "destructive", title: "Delivery zone/address is required" });
      return;
    }

    if (!user?.email) {
      toast({ variant: "destructive", title: "User email not found" });
      return;
    }

    setProcessing(true);
    try {
      const { data: customer } = await supabase
        .from("customers")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      if (!customer) throw new Error("Customer profile not found");

      const orderIds: string[] = [];

      // Create a pending order record for each business
      for (const [bizId, data] of Object.entries(businessesToCheckout)) {
        const items = data.items.map(item => ({
          product_id: item.product_id || item.service_id || "unknown",
          productId: item.product_id || item.service_id || "unknown",
          name: item.products?.name || item.services?.name || "Item",
          price: Number(item.products?.price) || Number(item.services?.price_min) || 0,
          quantity: item.quantity,
          total: (Number(item.products?.price) || Number(item.services?.price_min) || 0) * item.quantity
        }));

        const bizSubtotal = data.total;
        const bizDeliveryFee = deliveryType === "standard" ? (computedDeliveryFees[bizId] ?? 1000) : 0;
        const bizDiscount = hasIdicDiscount ? Math.round(bizSubtotal * 0.1) : 0;
        const bizTotal = bizSubtotal + bizDeliveryFee - bizDiscount;
        const commissionAmount = Math.round(bizSubtotal * 0.1); // 10% commission

        const { data: newOrder, error: orderErr } = await supabase
          .from("orders")
          .insert({
            business_id: bizId,
            customer_id: customer.id,
            status: "pending",
            items: items,
            subtotal: bizSubtotal,
            delivery_fee: bizDeliveryFee,
            platform_fee: 0,
            commission_amount: commissionAmount,
            total: bizTotal,
            delivery_address: deliveryType === "pickup" ? null : address.trim() || null,
            delivery_notes: deliveryType === "standard" && instructions.trim() ? `Instructions: ${instructions.trim()}` : null,
          })
          .select("id")
          .single();

        if (orderErr || !newOrder) {
          throw new Error(orderErr?.message || "Failed to create order for " + (data.business?.company_name || "store"));
        }
        orderIds.push(newOrder.id);
      }

      // Initialize Paystack payment for the total sum of all orders
      const payload = {
        email: user.email,
        amount: total,
        orderId: orderIds.join(","), // pass comma-separated list of order IDs
        metadata: {
          order_id: orderIds.join(","),
          multiple_stores: true
        }
      };

      const { data: payData, error: payErr } = await supabase.functions.invoke("initialize-payment", {
        body: payload
      });

      if (payErr) throw payErr;
      if (!payData?.success || !payData?.authorization_url) {
        throw new Error(payData?.error || "Failed to initialize payment gateway transaction");
      }

      // Clear customer cart upon order creation
      await supabase.from("cart_items").delete().eq("customer_id", customer.id);

      window.location.href = payData.authorization_url;

    } catch (err: any) {
      console.error("Payment error:", err);
      toast({ variant: "destructive", title: "Checkout Error", description: err.message || "Failed to initialize checkout" });
      setProcessing(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6 md:p-10 animate-fade-in pb-24 space-y-6">
        <Button 
          variant="ghost" 
          className="mb-2 -ml-4 rounded-full text-muted-foreground hover:text-foreground" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Cart
        </Button>

        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight text-foreground">Secure Checkout</h1>
          <p className="text-sm text-muted-foreground">Complete your order with Paystack secure payment</p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 pt-4">
          {/* Left Column: Delivery Details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-lg font-bold tracking-tight text-foreground">Delivery Method</h2>
              <RadioGroup 
                value={deliveryType} 
                onValueChange={(val) => setDeliveryType(val as "standard" | "pickup")}
                className="grid grid-cols-2 gap-4"
              >
                <div>
                  <RadioGroupItem value="standard" id="standard" className="peer sr-only" />
                  <Label 
                    htmlFor="standard" 
                    className="flex flex-col items-center justify-center rounded-2xl border border-border/30 bg-card p-5 hover:bg-accent/40 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/[0.02] peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-300"
                  >
                    <Truck className="mb-2.5 h-5 w-5" />
                    <span className="text-xs font-bold">Delivery (OOU Matrix)</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                  <Label 
                    htmlFor="pickup" 
                    className="flex flex-col items-center justify-center rounded-2xl border border-border/30 bg-card p-5 hover:bg-accent/40 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/[0.02] peer-data-[state=checked]:text-primary cursor-pointer transition-all duration-300"
                  >
                    <Store className="mb-2.5 h-5 w-5" />
                    <span className="text-xs font-bold">Store Pickup (Free)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {deliveryType === "standard" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                <h2 className="text-lg font-bold tracking-tight text-foreground">Delivery Address</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="zone-picker" className="text-xs font-bold text-muted-foreground">Select OOU Campus Landmark / Zone (For Cheaper Fees)</Label>
                    <Select value={selectedZone} onValueChange={(val) => {
                      setSelectedZone(val);
                      const zoneName = OOU_ZONE_NAMES[val as OouZone];
                      if (val !== 'UNKNOWN') {
                        setAddress(zoneName);
                      }
                    }}>
                      <SelectTrigger id="zone-picker" className="rounded-xl border-border/20 bg-muted/30 h-11 text-sm">
                        <SelectValue placeholder="Select landmark/zone..." />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OOU_ZONE_NAMES).map(([zone, name]) => (
                          <SelectItem key={zone} value={zone} className="text-sm">
                            {name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-bold text-muted-foreground">Detailed Address Description (Hostel, Room, etc.)</Label>
                    <Textarea 
                      id="address" 
                      placeholder="Enter details like building number, hostel name, room number" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="resize-none rounded-xl border-border/20 bg-muted/30 focus-visible:bg-card focus-visible:ring-primary/20 transition-all min-h-[100px] text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instructions" className="text-xs font-bold text-muted-foreground">Delivery Instructions (Optional)</Label>
                    <Input 
                      id="instructions" 
                      placeholder="e.g. Call upon arrival, drop at reception" 
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      className="rounded-xl border-border/20 bg-muted/30 focus-visible:bg-card focus-visible:ring-primary/20 transition-all h-11 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div>
            <div className="bg-card/45 backdrop-blur-md border border-border/20 rounded-[28px] p-6 shadow-sm sticky top-24 space-y-6">
              <h2 className="text-lg font-bold tracking-tight text-foreground">Order Summary</h2>
              
              <div className="space-y-6 max-h-[280px] overflow-y-auto pr-1">
                {Object.entries(businessesToCheckout).map(([bizId, data]) => (
                  <div key={bizId} className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{data.business?.company_name || "Store"}</p>
                    <div className="space-y-2 pl-2 border-l border-border/40">
                      {data.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2 flex-1 overflow-hidden">
                            <div className="font-bold text-muted-foreground bg-muted/50 w-5 h-5 flex items-center justify-center rounded-lg text-[9px] shrink-0">
                              {item.quantity}x
                            </div>
                            <span className="truncate text-foreground/80 font-medium">
                              {item.products?.name || item.services?.name || "Item"}
                            </span>
                          </div>
                          <span className="font-bold text-foreground ml-4">
                            ₦{((Number(item.products?.price) || Number(item.services?.price_min) || 0) * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                      {deliveryType === "standard" && (
                        <div className="flex justify-between text-[10px] text-muted-foreground pl-7">
                          <span>Delivery:</span>
                          <span className="font-bold text-foreground/70">₦{(computedDeliveryFees[bizId] ?? 1000).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-border/20" />

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground/85">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Total Delivery Fee</span>
                  <span className="font-semibold text-foreground/85">₦{deliveryFee.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>IDIC 10% Discount</span>
                    <span>-₦{discountAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="h-px bg-border/20" />

              <div className="flex justify-between items-center font-extrabold text-lg">
                <span>Total</span>
                <span className="text-primary text-xl">₦{total.toLocaleString()}</span>
              </div>

              <Button 
                className="w-full h-12 text-base rounded-full shadow-premium hover:shadow-premium-lg transition-all duration-300" 
                onClick={handlePayment}
                disabled={processing}
              >
                {processing ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                ) : (
                  <><ShieldCheck className="mr-2 h-5 w-5" /> Pay ₦{total.toLocaleString()}</>
                )}
              </Button>
              
              {hasIdicDiscount && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl p-2.5 text-center text-xs font-bold animate-pulse">
                  🏆 IDIC Competitor Promo Applied! (10% Off)
                </div>
              )}

              <p className="text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1 opacity-70">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> 100% Secure Transaction via Paystack
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
