import React, { useState } from "react";
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
import { Loader2, ArrowLeft, Truck, Store, ShieldCheck } from "lucide-react";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("business");
  const { user } = useAuth();
  const { cartByBusiness, isLoading } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [deliveryType, setDeliveryType] = useState<"standard" | "pickup">("standard");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [processing, setProcessing] = useState(false);

  const cartData = businessId ? cartByBusiness[businessId] : null;
  
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!cartData || !cartData.items.length) {
    return (
      <DashboardLayout>
        <div className="max-w-md mx-auto mt-20 text-center space-y-4">
          <h2 className="text-xl font-semibold">Your cart is empty</h2>
          <Button onClick={() => navigate("/customer/discover")}>Go back to shopping</Button>
        </div>
      </DashboardLayout>
    );
  }

  const subtotal = cartData.total;
  const deliveryFee = deliveryType === "standard" ? 1500 : 0;
  const total = subtotal + deliveryFee;

  const handlePayment = async () => {
    if (deliveryType === "standard" && !address.trim()) {
      toast({ variant: "destructive", title: "Delivery address is required" });
      return;
    }

    if (!user?.email) {
      toast({ variant: "destructive", title: "User email not found" });
      return;
    }

    setProcessing(true);
    try {
      const items = cartData.items.map(item => ({
        productId: item.product_id || item.service_id || "unknown",
        name: item.products?.name || item.services?.name || "Item",
        price: Number(item.products?.price) || Number(item.services?.price_min) || 0,
        quantity: item.quantity
      }));

      const payload = {
        email: user.email,
        businessId: businessId,
        items: items,
        subtotal: subtotal,
        deliveryFee: deliveryFee,
        total: total,
        deliveryType: deliveryType,
        deliveryAddress: address,
        deliveryInstructions: instructions
      };

      const { data, error } = await supabase.functions.invoke("initialize-payment", {
        body: payload
      });

      if (error) throw error;

      if (!data?.success || !data?.authorization_url) {
        throw new Error(data?.error || "Failed to initialize payment");
      }

      // Redirect to Paystack
      window.location.href = data.authorization_url;

    } catch (err: any) {
      console.error("Payment error:", err);
      toast({ variant: "destructive", title: "Payment Error", description: err.message || "Failed to initialize checkout" });
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
                    <span className="text-xs font-bold">Delivery (₦1,500)</span>
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
                    <Label htmlFor="address" className="text-xs font-bold text-muted-foreground">Full Address</Label>
                    <Textarea 
                      id="address" 
                      placeholder="Enter your full campus / residential delivery address" 
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
              
              <div className="space-y-4 max-h-[180px] overflow-y-auto pr-1">
                {cartData.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                      <div className="font-bold text-muted-foreground bg-muted/50 w-5.5 h-5.5 flex items-center justify-center rounded-lg text-[10px]">
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
              </div>

              <div className="h-px bg-border/20" />

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground/85">₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-foreground/85">₦{deliveryFee.toLocaleString()}</span>
                </div>
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
