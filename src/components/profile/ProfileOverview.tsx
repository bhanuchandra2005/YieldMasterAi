import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Camera, MapPin, User as UserIcon, Phone, Globe, Save, Loader2, Check } from "lucide-react";
import { User, api } from "@/lib/api";
import { toast } from "sonner";

interface ProfileOverviewProps {
  user: User | null;
  onUpdate: (user: User) => void;
}

export function ProfileOverview({ user, onUpdate }: ProfileOverviewProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    location: user?.location || "",
    bio: user?.bio || "",
    phone: user?.phone || "",
    website: user?.website || "",
  });
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const displayName = user?.name || user?.email?.split("@")[0] || "User";
  const avatarLetter = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }

    const url = URL.createObjectURL(file);
    setAvatarPreview((prev) => {
      if (prev && !prev.startsWith("data:") && !prev.startsWith("http")) URL.revokeObjectURL(prev);
      return url;
    });
    setAvatarFile(file);
    e.target.value = "";
    toast.success("Photo selected. Don't forget to save changes!");
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const payload: any = { ...formData };
      
      // Clean up empty strings to undefined to match previous logic or satisfy schema
      Object.keys(payload).forEach(key => {
        if (payload[key] === "") payload[key] = undefined;
      });

      if (avatarFile) {
        payload.avatarUrl = await fileToDataUrl(avatarFile);
      }
      
      const updated = await api.users.updateMe(payload);
      onUpdate(updated);
      setAvatarFile(null);
      setSuccess(true);
      toast.success("Profile updated perfectly!");
      
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="max-w-3xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 bg-card border rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
        <motion.div
          className="relative z-10 shrink-0"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg border-4 border-background inner-shadow-sm">
            {avatarPreview ? (
              <img src={avatarPreview} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              avatarLetter
            )}
          </div>
          <motion.button
            type="button"
            className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-background border-2 border-border flex items-center justify-center shadow-lg text-muted-foreground hover:text-primary transition-colors"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAvatarClick}
            aria-label="Change profile picture"
          >
            <Camera className="w-5 h-5" />
          </motion.button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </motion.div>
        <div className="z-10 bg-background/50 backdrop-blur-sm p-4 rounded-xl border border-white/10 dark:border-black/10">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">{displayName}</h2>
          <p className="text-sm font-medium text-primary mt-1">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative group">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="pl-10 h-11 bg-background/50 focus:bg-background transition-colors" placeholder="Your full name" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <div className="relative group">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input id="location" name="location" value={formData.location} onChange={handleInputChange} className="pl-10 h-11 bg-background/50 focus:bg-background transition-colors" placeholder="e.g. New York, USA" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative group">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="pl-10 h-11 bg-background/50 focus:bg-background transition-colors" placeholder="+1 (555) 000-0000" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <div className="relative group">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input id="website" name="website" type="url" value={formData.website} onChange={handleInputChange} className="pl-10 h-11 bg-background/50 focus:bg-background transition-colors" placeholder="https://yourwebsite.com" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2 md:col-span-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} className="min-h-[100px] resize-none bg-background/50 focus:bg-background transition-colors" placeholder="Tell us a little bit about yourself..." />
          </motion.div>

        </div>

        <motion.div variants={itemVariants} className="pt-4 flex justify-end border-t border-border/50">
          <Button
            type="submit"
            disabled={saving}
            className={`h-11 px-8 relative overflow-hidden transition-all ${success ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}`}
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {saving ? (
                <motion.span key="loading" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </motion.span>
              ) : success ? (
                <motion.span key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="flex items-center">
                  <Check className="w-4 h-4 mr-2" /> Saved
                </motion.span>
              ) : (
                <motion.span key="idle" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex items-center font-medium">
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
