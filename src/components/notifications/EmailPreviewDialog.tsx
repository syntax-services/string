import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mail, Sun, Moon, Sparkles } from "lucide-react";
import { generateEmailHtml, EmailType } from "@/hooks/usePremiumMail";

interface EmailPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  notification: {
    title: string;
    message: string;
    data?: {
      email_type?: EmailType;
      subject?: string;
      recipient_email?: string;
      recipient_name?: string;
      html_body?: string;
      theme?: "dark" | "light" | "mono";
      variables?: Record<string, any>;
    };
  } | null;
}

export function EmailPreviewDialog({ isOpen, onClose, notification }: EmailPreviewDialogProps) {
  // Local theme selector so user can dynamically test layouts
  const [emailTheme, setEmailTheme] = useState<"dark" | "light" | "mono">(
    notification?.data?.theme || "dark"
  );

  // Sync theme when notification changes
  React.useEffect(() => {
    if (notification?.data?.theme) {
      setEmailTheme(notification.data.theme);
    }
  }, [notification?.data?.theme]);

  if (!notification || notification.data?.email_type === undefined) return null;

  const emailData = notification.data;
  const emailType = emailData.email_type as EmailType;
  const recipientEmail = emailData.recipient_email || "user@string.co";
  const recipientName = emailData.recipient_name || "Merchant";
  const variables = emailData.variables || {};

  // Re-generate HTML body dynamically when user switches the toggle
  const renderedHtml = generateEmailHtml(emailType, {
    recipientEmail,
    recipientName,
    theme: emailTheme,
    variables
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full border border-border/40 bg-background/95 backdrop-blur-md rounded-[32px] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <DialogHeader className="text-left border-b pb-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold flex items-center gap-1.5">
                  Secure Email Preview
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Actual HSL-templated dispatch sent to: <span className="font-semibold text-foreground">{recipientEmail}</span>
                </DialogDescription>
              </div>
            </div>

            {/* Premium Theme Switcher Controls */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-full border border-border/30 w-fit shrink-0">
              <Button
                size="sm"
                variant={emailTheme === "dark" ? "default" : "ghost"}
                className="h-7 text-[10px] font-bold rounded-full px-2.5"
                onClick={() => setEmailTheme("dark")}
              >
                <Moon className="h-3 w-3 mr-1" />
                Dark
              </Button>
              <Button
                size="sm"
                variant={emailTheme === "light" ? "default" : "ghost"}
                className="h-7 text-[10px] font-bold rounded-full px-2.5"
                onClick={() => setEmailTheme("light")}
              >
                <Sun className="h-3 w-3 mr-1" />
                Light
              </Button>
              <Button
                size="sm"
                variant={emailTheme === "mono" ? "default" : "ghost"}
                className="h-7 text-[10px] font-bold rounded-full px-2.5"
                onClick={() => setEmailTheme("mono")}
              >
                <Sparkles className="h-3 w-3 mr-1 text-yellow-500" />
                Mono
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Email Body Iframe sandbox representing a realistic email client frame */}
        <div className="flex-1 min-h-[350px] bg-muted/20 border border-border/30 rounded-2xl overflow-hidden mt-4 relative">
          <iframe
            srcDoc={renderedHtml}
            title="Email Preview Body"
            className="w-full h-full border-none bg-transparent"
            sandbox="allow-popups"
          />
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-4 pt-3 border-t shrink-0">
          <span>String Secure HSL Dispatch • Adaptive Mail Rendering</span>
          <Button
            size="sm"
            onClick={onClose}
            className="rounded-xl h-8 text-xs font-bold"
          >
            Close Preview
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
