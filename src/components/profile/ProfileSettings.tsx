import { useState } from "react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { api, User } from "@/lib/api";
import { toast } from "sonner";
import { BellWing, Moon, Sun, Bell } from "lucide-react";

interface ProfileSettingsProps {
  user: User | null;
  onUpdate: (user: User) => void;
}

export function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);

  const toggleEmailNotifications = async (checked: boolean) => {
    setLoading(true);
    try {
      const updated = await api.users.updateMe({ emailNotifications: checked });
      onUpdate(updated);
      toast.success(checked ? "Email notifications enabled" : "Email notifications disabled");
    } catch (err: any) {
      toast.error(err.message || "Failed to update preference");
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 max-w-2xl"
    >
      <motion.div variants={itemVariants} className="bg-card border rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <Sun className="w-5 h-5 dark:hidden" />
              <Moon className="w-5 h-5 hidden dark:block" />
            </div>
            <div>
              <Label className="text-base font-medium">Appearance</Label>
              <p className="text-sm text-muted-foreground mt-0.5">Toggle between light and dark modes</p>
            </div>
          </div>
          <Switch
            checked={theme === "dark"}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
          />
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-card border rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <Label className="text-base font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground mt-0.5">Receive updates about your activity and account</p>
            </div>
          </div>
          <Switch
            checked={Boolean(user?.emailNotifications)}
            onCheckedChange={toggleEmailNotifications}
            disabled={loading}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
