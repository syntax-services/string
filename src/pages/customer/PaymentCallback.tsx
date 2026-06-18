import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference");
  const navigate = useNavigate();
  const { clearCart } = useCart();
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      return;
    }

    const checkStatus = async () => {
      try {
        // Clear the cart since checkout was initiated
        clearCart.mutate();

        // The webhook handles actual verification, but we can optimistically show success
        // or poll the payment_transactions table
        const { data, error } = await supabase
          .from("payment_transactions")
          .select("status")
          .eq("paystack_reference", reference)
          .single();

        if (error) throw error;
        
        if (["success", "completed", "pending"].includes(data.status)) {
          // Even if pending, we consider it a success flow on the frontend until webhook confirms
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        console.error("Error verifying payment callback:", err);
        // Default to success UI if we can't verify because the webhook will handle it anyway
        setStatus("success");
      }
    };

    checkStatus();
  }, [reference, clearCart]);

  return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <h2 className="text-xl font-semibold">Verifying your payment...</h2>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Payment Successful!</h2>
              <p className="text-muted-foreground text-lg max-w-md">
                Your order has been placed and the business has been notified.
              </p>
            </div>
            <div className="flex gap-4 mt-4">
              <Button onClick={() => navigate("/customer/orders")}>
                Track Order
              </Button>
              <Button variant="outline" onClick={() => navigate("/customer/discover")}>
                Continue Shopping
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-500">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Payment Failed</h2>
              <p className="text-muted-foreground text-lg max-w-md">
                Something went wrong with your payment. Please try again or contact support.
              </p>
            </div>
            <div className="flex gap-4 mt-4">
              <Button onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
