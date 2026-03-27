import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Sprout,
  Activity,
  MapPin,
  CloudRain,
  Calendar,
  Settings,
  LogOut,
  Search,
  Bell,
  User,
  HelpCircle,
  Zap,
  ChevronDown,
  PanelLeft,
  ScanLine,
  ChevronRight,
  Store,
  Landmark,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { BoliVoiceAssistant } from "@/components/BoliVoiceAssistant";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


const NAV_ITEMS = [
  { icon: BarChart3, label: "Dashboard", path: "/dashboard" },
  { icon: Sprout, label: "Predictions", path: "/predictions" },
  { icon: Activity, label: "Analytics", path: "/analytics" },
  { icon: MapPin, label: "Fields", path: "/fields" },
  { icon: CloudRain, label: "Weather", path: "/weather" },
  { icon: Calendar, label: "Planning", path: "/planning" },
  { icon: ScanLine, label: "Kisan Vision", path: "/vision" },
  { icon: Store, label: "Mandi Connect", path: "/mandi" },
  { icon: Landmark, label: "Sarkari Support", path: "/schemes" },
] as const;

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const SAMPLE_NOTIFICATIONS = [
  { id: "1", title: "Yield prediction ready", body: "North Field wheat prediction completed.", time: "2m ago", unread: true },
  { id: "2", title: "Weather alert", body: "Rain expected in 3 days. Consider irrigation.", time: "1h ago", unread: true },
  { id: "3", title: "Weekly report", body: "Your farm analytics summary is ready.", time: "Yesterday", unread: false },
];

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem("ym.sidebar.open");
      return raw === null ? true : raw === "true";
    } catch {
      return true;
    }
  });
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const avatarLetter = (user?.name?.[0] || user?.email?.[0] || "U").toUpperCase();
  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    try {
      localStorage.setItem("ym.sidebar.open", String(sidebarOpen));
    } catch {
      // ignore
    }
  }, [sidebarOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <div className="min-h-screen bg-background flex">
      <TooltipProvider delayDuration={0}>
        <aside
          data-ym-sidebar={sidebarOpen ? "expanded" : "collapsed"}
          className={[
            "hidden lg:flex flex-col bg-sidebar border-r border-sidebar-border",
            "transition-[width] duration-300 ease-out",
            sidebarOpen ? "w-64" : "w-16",
          ].join(" ")}
        >
          <div className="p-4 flex items-center justify-between gap-2">
            <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
              <Logo size="sm" className="text-sidebar-foreground shrink-0" />
              <span
                className={[
                  "text-xs font-semibold tracking-tight text-sidebar-foreground/90 truncate",
                  sidebarOpen ? "opacity-100" : "opacity-0 w-0",
                ].join(" ")}
              >
                YieldMaster AI
              </span>
            </Link>

            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="ym-sidebar-toggle"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          </div>

          <nav
            className="flex-1 px-2 py-2"
            onKeyDown={(e) => {
              if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
              const items = Array.from(
                (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>("[data-ym-sidebar-item='true']"),
              );
              if (items.length === 0) return;
              const activeIndex = items.findIndex((el) => el === document.activeElement);
              const dir = e.key === "ArrowDown" ? 1 : -1;
              const nextIndex = activeIndex === -1 ? 0 : (activeIndex + dir + items.length) % items.length;
              items[nextIndex]?.focus();
              e.preventDefault();
            }}
          >
            <div className="space-y-1">
              {NAV_ITEMS.map((item, idx) => {
                const active = currentPath === item.path || (item.path !== "/dashboard" && currentPath.startsWith(item.path));
                const content = (
                  <Link
                    key={item.path}
                    to={item.path}
                    data-ym-sidebar-item="true"
                    tabIndex={0}
                    className={[
                      "ym-sidebar-item group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                      "outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
                      active ? "ym-sidebar-item--active" : "ym-sidebar-item--idle",
                    ].join(" ")}
                  >
                    <motion.span
                      className="relative z-10 grid place-items-center"
                      initial={false}
                      whileHover={{ x: 0.5 }}
                      transition={{ duration: 0.18, ease: "easeOut" }}
                    >
                      <item.icon className="w-[18px] h-[18px]" />
                    </motion.span>
                    <span
                      className={[
                        "relative z-10 truncate",
                        sidebarOpen ? "opacity-100" : "opacity-0 w-0",
                      ].join(" ")}
                    >
                      {item.label}
                    </span>

                    <AnimatePresence>
                      {active && (
                        <motion.span
                          className="ym-sidebar-indicator"
                          layoutId="ym-sidebar-indicator"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -8 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                        />
                      )}
                    </AnimatePresence>
                  </Link>
                );

                return sidebarOpen ? (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: idx * 0.03 }}
                  >
                    {content}
                  </motion.div>
                ) : (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right" align="center">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </nav>

          <div className="p-2 border-t border-sidebar-border space-y-1">
            {sidebarOpen ? (
              <Link
                to="/settings"
                data-ym-sidebar-item="true"
                className="ym-sidebar-item ym-sidebar-item--idle group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium"
              >
                <Settings className="w-[18px] h-[18px]" />
                <span className="truncate">Settings</span>
              </Link>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/settings"
                    data-ym-sidebar-item="true"
                    className="ym-sidebar-item ym-sidebar-item--idle group flex items-center justify-center rounded-xl px-3 py-2.5"
                  >
                    <Settings className="w-[18px] h-[18px]" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  Settings
                </TooltipContent>
              </Tooltip>
            )}

            {sidebarOpen ? (
              <button
                type="button"
                onClick={handleLogout}
                data-ym-sidebar-item="true"
                className="ym-sidebar-item ym-sidebar-item--idle group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-left"
              >
                <LogOut className="w-[18px] h-[18px]" />
                <span className="truncate">Sign out</span>
              </button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleLogout}
                    data-ym-sidebar-item="true"
                    className="ym-sidebar-item ym-sidebar-item--idle group flex w-full items-center justify-center rounded-xl px-3 py-2.5"
                  >
                    <LogOut className="w-[18px] h-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  Sign out
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </aside>
      </TooltipProvider>

      <div className="flex-1 flex flex-col">
        <header className="dashboard-header h-14 border-b border-border bg-card/50 backdrop-blur flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <div className="dashboard-header-search relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search..." className="pl-8 h-8 w-48 text-xs transition-all duration-200 focus:w-56 focus:ring-2 focus:ring-primary/20" />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="dashboard-header-icon relative p-2 h-8 w-8 rounded-lg">
                  <Bell className="w-4 h-4 text-muted-foreground" />
                  <AnimatePresence>
                    {unreadCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-0.5 right-0.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background"
                      />
                    )}
                  </AnimatePresence>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        markAllRead();
                      }}
                      className="text-xs text-primary font-medium hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((n) => (
                  <DropdownMenuItem
                    key={n.id}
                    className="flex flex-col items-start gap-0.5 py-2.5 cursor-pointer"
                    onSelect={() => navigate("/dashboard")}
                  >
                    <div className="flex w-full items-center gap-2">
                      {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                      <span className={`text-sm font-medium ${n.unread ? "text-foreground" : "text-muted-foreground"}`}>
                        {n.title}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground pl-3.5">{n.body}</span>
                    <span className="text-[10px] text-muted-foreground/80 pl-3.5">{n.time}</span>
                  </DropdownMenuItem>
                ))}
                {notifications.length === 0 && (
                  <div className="py-6 text-center text-sm text-muted-foreground">No notifications</div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="dashboard-header-icon p-1.5 rounded-lg gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground hidden sm:inline">Quick</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Quick actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/predictions" className="flex items-center gap-2">
                    <Sprout className="w-4 h-4" />
                    New prediction
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/fields" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Add field
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/weather" className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4" />
                    Check weather
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/planning" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    View planning
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="dashboard-header-avatar w-8 h-8 rounded-full overflow-hidden gradient-hero flex items-center justify-center text-xs font-bold text-primary-foreground transition-transform duration-200 hover:scale-105 hover:ring-2 hover:ring-primary/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                >
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    avatarLetter
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{user?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <a href="#" className="flex items-center gap-2 cursor-pointer">
                    <HelpCircle className="w-4 h-4" />
                    Help & support
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                  onSelect={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background/50 backdrop-blur-3xl pt-16 lg:pt-0">
          <div className="container mx-auto p-4 md:p-6 lg:p-8 relative">
            {children}
          </div>
        </main>
      </div>
      <BoliVoiceAssistant />


    </div>
  );
}
