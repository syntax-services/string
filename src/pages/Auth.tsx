import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, User, Building2, Mail, Lock, UserPlus } from "lucide-react";
import { z } from "zod";
import stringLogoLight from "@/assets/String-logo-light.png";
import stringLogoDark from "@/assets/String-logo-dark.png";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signupSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Auth() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "signup";
  const [isLogin, setIsLogin] = useState(mode === "login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] = useState<"customer" | "business">("customer");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, user, loading: authLoading, dashboardPath } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setIsLogin(mode === "login");
    setErrors({});
  }, [mode]);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(dashboardPath, { replace: true });
    }
  }, [authLoading, dashboardPath, navigate, user]);

  const validateForm = () => {
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ fullName, email, password, confirmPassword, referralCode });
      }
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          fieldErrors[err.path[0] as string] = err.message;
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            variant: "destructive",
            title: "Sign in failed",
            description: error.message === "Invalid login credentials"
              ? "Invalid email or password. Please try again."
              : error.message,
          });
        }
      } else {
        const { error } = await signUp(email, password, {
          full_name: fullName.trim(),
          account_type: accountType,
          referral_code: referralCode.trim() || undefined,
        });
        if (error) {
          let message = error.message;
          if (message.includes("already registered")) {
            message = "This email is already registered. Please sign in instead.";
          }
          toast({
            variant: "destructive",
            title: "Sign up failed",
            description: message,
          });
        } else {
          toast({
            title: "Check your email",
            description: "A secure link has been sent to your mail for email confirmation.",
            duration: 10000,
          });
          navigate("/onboarding", { replace: true });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container flex h-14 items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to home</span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex flex-1 items-center justify-center p-4">
        <div className={cn("w-full animate-fade-in", isLogin ? "max-w-sm" : "max-w-md")}>
          {/* Logo */}
          <div className="mb-6 text-center flex flex-col items-center">
            <img src={stringLogoLight} alt="String Logo" className="h-14 w-auto mb-3 object-contain logo-light" />
            <img src={stringLogoDark} alt="String Logo" className="h-14 w-auto mb-3 object-contain logo-dark" />
            <h1 className="text-2xl font-semibold text-foreground">
              {isLogin ? "Welcome back" : "Join String"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isLogin
                ? "Sign in to access your dashboard"
                : "Create your account and start connecting"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Signup-only fields */}
            {!isLogin && (
              <>
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={loading}
                      className="pl-10"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>

                {/* Account Type Selection */}
                <div className="space-y-2">
                  <Label>I want to join as</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAccountType("customer")}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all text-sm",
                        accountType === "customer"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/40"
                      )}
                    >
                      <User className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">Customer</p>
                        <p className="text-xs text-muted-foreground">Discover services</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType("business")}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all text-sm",
                        accountType === "business"
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/40"
                      )}
                    >
                      <Building2 className="h-4 w-4 text-primary" />
                      <div>
                        <p className="font-medium">Business</p>
                        <p className="text-xs text-muted-foreground">Grow your brand</p>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  className="pl-10"
                />
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password (signup only) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                    className="pl-10"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Referral Code (signup only) */}
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code (optional)</Label>
                <Input
                  id="referralCode"
                  placeholder="STR-XXXXXX"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Have a friend on String? Enter their code to earn bonus points!
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? "Signing in..." : "Creating account..."}
                </>
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          {/* Toggle */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <Link
              to={`/auth?mode=${isLogin ? "signup" : "login"}`}
              className="font-medium text-primary hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
