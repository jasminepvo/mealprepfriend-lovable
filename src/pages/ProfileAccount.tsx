import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft } from "lucide-react";

const ProfileAccount = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setEmail(user.email || "");
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);

    if (email !== user.email) {
      const { error } = await supabase.auth.updateUser({ email });
      if (error) {
        toast({ title: "Error updating email", description: error.message, variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ title: "Confirmation sent", description: "Check your new email to confirm the change." });
    } else {
      toast({ title: "Profile saved" });
    }

    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 flex items-center gap-3 bg-card border-b border-border px-6 py-3">
        <button onClick={() => navigate("/meal-plan?sheet=open")} className="p-1"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
        <h1 className="text-lg font-bold text-foreground">My Profile</h1>
      </header>

      <div className="px-6 py-8 pb-28">
        <section className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Full name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </section>

        <section className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-input bg-card px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </section>

        <section>
          <button
            onClick={() => {
              supabase.auth.resetPasswordForEmail(user?.email || "");
              toast({ title: "Password reset email sent" });
            }}
            className="w-full rounded-lg border-2 border-border px-4 py-3 text-sm font-medium text-foreground text-left"
          >
            Change password →
          </button>
        </section>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-border px-6 py-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-lg bg-primary px-6 py-4 text-lg font-semibold text-primary-foreground shadow-md disabled:opacity-40 active:scale-[0.98] transition-transform"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default ProfileAccount;
