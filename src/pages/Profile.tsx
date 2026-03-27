import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Activity, Settings, Key } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

import { ProfileOverview } from "@/components/profile/ProfileOverview";
import { ProfileSecurity } from "@/components/profile/ProfileSecurity";
import { ProfileActivity } from "@/components/profile/ProfileActivity";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { ProfileCompletionBar } from "@/components/profile/ProfileCompletionBar";

const Profile = () => {
  const { user, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  const tabVariants = {
    hidden: { opacity: 0, y: 10 },
    enter: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <>
      <main className="max-w-6xl mx-auto py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar / Top Navigation relative to screen size */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileCompletionBar user={user} />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto pb-2 mb-6 hide-scrollbar">
                <TabsList className="h-12 w-full justify-start bg-muted/50 p-1 shrink-0 inline-flex min-w-max border border-border/10">
                  <TabsTrigger value="overview" className="gap-2 shrink-0 px-4">
                    <User className="w-4 h-4" /> Overview
                  </TabsTrigger>
                  <TabsTrigger value="security" className="gap-2 shrink-0 px-4">
                    <Key className="w-4 h-4" /> Security
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="gap-2 shrink-0 px-4">
                    <Activity className="w-4 h-4" /> Activity
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2 shrink-0 px-4">
                    <Settings className="w-4 h-4" /> Settings
                  </TabsTrigger>
                </TabsList>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={tabVariants}
                  initial="hidden"
                  animate="enter"
                  exit="exit"
                  className="w-full"
                >
                  <TabsContent value="overview" className="mt-0 outline-none">
                    <ProfileOverview user={user} onUpdate={setUser} />
                  </TabsContent>
                  
                  <TabsContent value="security" className="mt-0 outline-none">
                    <ProfileSecurity />
                  </TabsContent>
                  
                  <TabsContent value="activity" className="mt-0 outline-none">
                    <ProfileActivity />
                  </TabsContent>
                  
                  <TabsContent value="settings" className="mt-0 outline-none">
                    <ProfileSettings user={user} onUpdate={setUser} />
                  </TabsContent>
                </motion.div>
              </AnimatePresence>
            </Tabs>
          </div>
        </div>
      </main>
    </>
  );
};

export default Profile;
