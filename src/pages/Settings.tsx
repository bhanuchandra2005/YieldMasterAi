import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Shield, Globe, CreditCard, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { toast } from "sonner";

const settingsGroups = [
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Weather alerts", desc: "Severe weather warnings for your fields", default: true },
      { label: "Weekly digest", desc: "Summary of your farm analytics", default: false },
    ],
  },
  {
    title: "Privacy & Security",
    icon: Shield,
    items: [
      { label: "Two-factor authentication", desc: "Add extra security to your account", default: false },
      { label: "Data sharing", desc: "Share anonymized data to improve models", default: true },
    ],
  },
  {
    title: "Preferences",
    icon: Globe,
    items: [
      { label: "Metric units", desc: "Use kg/ha instead of lbs/acre", default: true },
      { label: "Auto-refresh dashboard", desc: "Refresh data every 5 minutes", default: true },
    ],
  },
];

const SettingsPage = () => {
  const { theme, setTheme } = useTheme();
  const { user, setUser } = useAuth();
  const [savingEmail, setSavingEmail] = useState(false);

  const toggleEmailNotifications = async (checked: boolean) => {
    setSavingEmail(true);
    try {
      const updated = await api.users.updateMe({ emailNotifications: checked });
      setUser(updated);
      toast.success(checked ? "Email notifications enabled" : "Email notifications disabled");
    } catch (err: any) {
      toast.error(err.message || "Failed to update preference");
    } finally {
      setSavingEmail(false);
    }
  };

  return (
    <>
      <main className="max-w-2xl mx-auto py-8 space-y-6">
        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Sun className="w-4 h-4 dark:hidden" />
                <Moon className="w-4 h-4 hidden dark:block" />
              </div>
              <div>
                <p className="text-sm font-semibold">Appearance</p>
                <p className="text-xs text-muted-foreground">Toggle between light and dark modes</p>
              </div>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={(v) => setTheme(v ? "dark" : "light")} />
          </div>
        </motion.div>

        {/* Email notifications */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="stat-card"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">Email Notifications</p>
                <p className="text-xs text-muted-foreground">Receive updates about your activity and account</p>
              </div>
            </div>
            <Switch
              checked={Boolean(user?.emailNotifications)}
              onCheckedChange={toggleEmailNotifications}
              disabled={savingEmail}
            />
          </div>
        </motion.div>

        {settingsGroups.map((group, gi) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + gi * 0.06 }}
            className="stat-card"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <group.icon className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">{group.title}</h3>
            </div>
            <div className="space-y-4">
              {group.items.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.default} />
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* Billing */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.32 }}
          className="stat-card"
        >
          <div className="flex items-center gap-2.5 mb-4">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Billing</h3>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-secondary">
            <div>
              <p className="text-sm font-semibold">Pro Plan</p>
              <p className="text-xs text-muted-foreground">₹999/month · Renews Mar 28</p>
            </div>
            <Button variant="outline" size="sm" className="text-xs h-7">
              Manage
            </Button>
          </div>
        </motion.div>

        <div className="flex justify-end">
          <Button variant="destructive" size="sm" className="text-xs">
            Delete Account
          </Button>
        </div>
      </main>
    </>
  );
};

export default SettingsPage;
