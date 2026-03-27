import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { User } from "@/lib/api";

interface ProfileCompletionBarProps {
  user: User | null;
}

export function ProfileCompletionBar({ user }: ProfileCompletionBarProps) {
  if (!user) return null;

  const fields = [
    "name",
    "email",
    "location",
    "bio",
    "phone",
    "website",
    "twitter",
    "avatarUrl",
  ] as const;
  
  const completedFields = fields.filter((field) => Boolean(user[field]));
  const percentage = Math.round((completedFields.length / fields.length) * 100);

  let statusText = "Getting started";
  if (percentage > 40) statusText = "Looking good";
  if (percentage > 80) statusText = "Almost there";
  if (percentage === 100) statusText = "Profile complete!";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border rounded-xl p-5 shadow-sm relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="flex justify-between items-end mb-3 relative z-10">
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-1">Profile Completion</h3>
          <p className="text-lg font-bold text-foreground">{percentage}% - {statusText}</p>
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
    </motion.div>
  );
}
