import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

import screenshotGoals from "@/assets/screenshot-goals.png";
import screenshotPreferences from "@/assets/screenshot-preferences.png";
import screenshotMealplan from "@/assets/screenshot-mealplan.png";
import screenshotCookguide from "@/assets/screenshot-cookguide.png";
import screenshotGrocery from "@/assets/screenshot-grocery.png";

const features = [
  { emoji: "🎯", title: "Set Your Goals", desc: "Tell us your calorie target and activity level" },
  { emoji: "🥑", title: "Pick Your Foods", desc: "Choose proteins, grains, and veggies you love" },
  { emoji: "📋", title: "Get Your Plan", desc: "AI builds your weekly meals, grocery list, and cook guide" },
];

const walkthrough = [
  {
    step: 1,
    title: "Calculate Your Needs",
    desc: "Enter your stats and the app calculates your daily calorie & macro targets using TDEE science.",
    emoji: "⚖️",
    screenshot: screenshotGoals,
  },
  {
    step: 2,
    title: "Pick Your Foods",
    desc: "Choose which meals to prep, pick your favorite proteins, grains, and veggies — the AI builds around your picks.",
    emoji: "🥑",
    screenshot: screenshotPreferences,
  },
  {
    step: 3,
    title: "Lock & Regenerate",
    desc: "AI generates balanced meals for every day. Love a meal? Lock it 🔒 and regenerate only the rest.",
    emoji: "🔄",
    screenshot: screenshotMealplan,
  },
  {
    step: 4,
    title: "Cook Guide",
    desc: "Step-by-step instructions with timing tips so you can prep everything in one session.",
    emoji: "👨‍🍳",
    screenshot: screenshotCookguide,
  },
  {
    step: 5,
    title: "Grocery List",
    desc: "Auto-generated grocery list grouped by aisle with quantities and estimated cost.",
    emoji: "🛒",
    screenshot: screenshotGrocery,
  },
];

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const authFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) navigate("/", { replace: true });
  }, [user, navigate]);

  useEffect(() => {
    if (!carouselApi) return;
    const onSelect = () => setCurrentSlide(carouselApi.selectedScrollSnap());
    carouselApi.on("select", onSelect);
    onSelect();
    return () => { carouselApi.off("select", onSelect); };
  }, [carouselApi]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: displayName }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
      }
      navigate("/");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <span className="text-4xl animate-pulse">🥗</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center justify-between bg-card border-b border-border px-6 py-3">
        <span className="text-lg font-bold text-foreground font-sans">
          🥗 MealPrepFriend
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => authFormRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          Log In
        </Button>
      </header>
      <div className="mx-auto max-w-2xl px-5 py-10 space-y-10">
        {/* Hero */}
        <div className="text-center space-y-3">
          <span className="text-5xl">🥗</span>
          <h1 className="text-3xl font-bold text-foreground font-serif">
            Your weekly meal prep, done in one Sunday.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-lg mx-auto">
            Set your goals, pick your foods, and get an AI-generated meal plan with grocery list and cook guide — all in under 5 minutes.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {features.map((f) => (
            <Card key={f.title} className="border-border/50">
              <CardContent className="p-4 text-center space-y-1">
                <span className="text-2xl">{f.emoji}</span>
                <p className="font-semibold text-foreground text-sm">{f.title}</p>
                <p className="text-muted-foreground text-xs leading-snug">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Walkthrough carousel */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground text-center">How it works</h2>
          <Carousel setApi={setCarouselApi} className="w-full">
            <CarouselContent>
              {walkthrough.map((slide) => (
                <CarouselItem key={slide.step}>
                  <Card className="border-border/50 bg-warm-sage">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                          {slide.step}
                        </span>
                        <span className="text-xl">{slide.emoji}</span>
                        <p className="font-semibold text-foreground text-sm">{slide.title}</p>
                      </div>
                      <p className="text-muted-foreground text-xs leading-relaxed">{slide.desc}</p>
                      <div className="rounded-lg border border-border overflow-hidden">
                        <img src={slide.screenshot} alt={slide.title} className="w-full h-auto" />
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5">
            {walkthrough.map((_, i) => (
              <button
                key={i}
                onClick={() => carouselApi?.scrollTo(i)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === currentSlide ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Auth form */}
        <Card ref={authFormRef} className="border-border/50">
          <CardContent className="p-6 space-y-4">
            <div className="text-center">
              <p className="font-semibold text-foreground">
                {isLogin ? "Welcome back!" : "Create your account"}
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              className="flex w-full items-center justify-center gap-3 rounded-lg border-2 border-border bg-card px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {!isLogin && (
                <input
                  type="text"
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-md disabled:opacity-50 active:scale-[0.98] transition-transform"
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => setIsLogin(!isLogin)} className="font-medium text-primary hover:underline">
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
