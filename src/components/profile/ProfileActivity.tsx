import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, UserActivityLog } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Activity, Key, LogIn, Settings, Trash, UserCog } from "lucide-react";

export function ProfileActivity() {
  const [logs, setLogs] = useState<UserActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.users.activityLogs()
      .then((data) => {
        if (mounted) setLogs(data);
      })
      .catch((err) => console.error("Failed to load activity", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "updated_profile":
        return <UserCog className="w-4 h-4 text-primary" />;
      case "changed_password":
        return <Key className="w-4 h-4 text-emerald-500" />;
      case "deleted_account":
        return <Trash className="w-4 h-4 text-destructive" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse flex gap-4 p-4 border rounded-xl">
            <div className="w-10 h-10 rounded-full bg-muted" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center p-12 bg-card border rounded-xl">
        <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium">No activity yet</h3>
        <p className="text-muted-foreground mt-2">Your recent actions will appear here.</p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 max-w-3xl relative before:absolute before:inset-y-0 before:left-7 before:w-px before:bg-border"
    >
      {logs.map((log) => (
        <motion.div
          key={log.id}
          variants={itemVariants}
          className="relative flex gap-6"
        >
          <div className="w-14 h-14 rounded-full bg-background border shadow-sm flex items-center justify-center shrink-0 z-10 relative mt-1">
            {getActionIcon(log.action)}
          </div>
          <div className="flex-1 bg-card border rounded-xl p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-semibold capitalize">{log.action.replace("_", " ")}</h4>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </span>
            </div>
            {log.details && (
              <p className="text-sm text-muted-foreground">{log.details}</p>
            )}
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
