import { motion } from "framer-motion";
import {
  TrendingUp, Droplets, Thermometer, Leaf, ChevronDown, Activity, Sprout,
  CloudRain, Sun, MapPin, Filter, Plus, Store, IndianRupee, ArrowUpRight, ArrowDownRight, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { api, type ActivityItem } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { Badge } from "@/components/ui/badge";

const ACTIVITY_ICONS: Record<string, React.ElementType> = {
  sprout: Sprout,
  "cloud-rain": CloudRain,
  activity: Activity,
  "trending-up": TrendingUp,
  leaf: Leaf,
};

const StatCard = ({ icon: Icon, label, value, trend, trendUp }: {
  icon: React.ElementType; label: string; value: string; trend: string; trendUp: boolean;
}) => (
  <motion.div
    variants={fadeIn}
    whileHover={{ y: -4, scale: 1.02 }}
    className="glass-card p-5"
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <Badge variant="outline" className={`text-[10px] font-bold tabular-nums border-0 ${trendUp ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive"}`}>
        {trendUp ? "↑" : "↓"} {trend}
      </Badge>
    </div>
    <p className="label-mono mb-1">{label}</p>
    <p className="text-2xl font-bold tabular-nums tracking-tight text-foreground">{value}</p>
  </motion.div>
);

const WeatherInsight = ({ userLocation }: { userLocation?: string }) => (
  <motion.div
    variants={fadeIn}
    className="glass-card p-5 border-l-4 border-l-primary relative overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-4 opacity-5">
      <CloudRain className="w-24 h-24" />
    </div>
    <div className="relative z-10 flex items-start gap-4">
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Sun className="w-6 h-6 text-primary animate-pulse" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
          AI Weather Insight
          <Badge className="bg-primary/20 text-primary border-0 text-[9px] h-4 uppercase">Advisory</Badge>
        </h4>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          High humidity and rising temperatures expected in <b>{userLocation || "your area"}</b>. 
          Perfect conditions for Rice blast. Monitor North fields and consider preventive spray if humidity exceeds 85%.
        </p>
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => api.dashboard.stats(),
  });
  const { data: yieldData = [] } = useQuery({
    queryKey: ["dashboard", "yieldTrends"],
    queryFn: () => api.dashboard.yieldTrends(),
  });
  const { data: weatherData = [] } = useQuery({
    queryKey: ["dashboard", "weather"],
    queryFn: () => api.dashboard.weather(),
  });
  const { data: cropDistribution = [] } = useQuery({
    queryKey: ["dashboard", "cropDistribution"],
    queryFn: () => api.dashboard.cropDistribution(),
  });
  const { data: activityList = [] } = useQuery({
    queryKey: ["dashboard", "activity"],
    queryFn: () => api.dashboard.activity(),
  });
  const { data: marketData } = useQuery({
    queryKey: ["dashboard", "market", user?.location],
    queryFn: () => api.market.getPrices(user?.location || "Regional"),
  });

  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <>
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
            <motion.div variants={fadeIn} className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Good morning, {displayName} 👋
                </h2>
                <p className="text-sm text-muted-foreground">Here's your farm's health baseline for today</p>
              </div>
              <Button className="gradient-hero text-primary-foreground border-0 text-xs h-10 px-5 rounded-full hover:shadow-lg transition-all" asChild>
                <Link to="/predictions?new=1">
                  <Plus className="w-4 h-4 mr-2" />
                  New Prediction
                </Link>
              </Button>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {statsLoading || !stats ? (
                    [1, 2, 3, 4].map((i) => (
                      <div key={i} className="glass-card h-28 animate-pulse bg-muted/20" />
                    ))
                  ) : (
                    <>
                      <StatCard icon={TrendingUp} label="Avg Yield" value={stats.avgYield} trend={stats.avgYieldTrend} trendUp={stats.avgYieldTrendUp} />
                      <StatCard icon={Thermometer} label="Temperature" value={stats.temperature} trend={stats.tempTrend} trendUp={stats.tempTrendUp} />
                      <StatCard icon={Droplets} label="Rainfall" value={stats.rainfall} trend={stats.rainfallTrend} trendUp={stats.rainfallTrendUp} />
                      <StatCard icon={Sun} label="Predictions" value={stats.predictionsCount} trend={stats.predictionsTrend} trendUp={stats.predictionsTrendUp} />
                    </>
                  )}
                </div>
              </div>
              <WeatherInsight userLocation={user?.location || "Hyderabad, IN"} />
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <motion.div variants={fadeIn} className="lg:col-span-2 glass-card !p-0 overflow-hidden group">
                <div className="p-6 pb-0 flex items-center justify-between">
                  <div>
                    <p className="label-mono mb-1">Yield Trends</p>
                    <p className="text-lg font-bold tabular-nums text-foreground group-hover:text-primary transition-colors">Crop Performance</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs h-8 hover:bg-primary/10 hover:text-primary">
                    <Filter className="w-3.5 h-3.5 mr-2" />
                    Detailed Analytics
                  </Button>
                </div>
                <div className="h-72 p-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={yieldData}>
                      <defs>
                        <linearGradient id="riceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(142, 64%, 36%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(142, 64%, 36%)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="wheatGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(42, 92%, 56%)" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="hsl(42, 92%, 56%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          borderRadius: 12, 
                          border: "1px solid hsl(var(--border))", 
                          boxShadow: "var(--shadow-elevated)", 
                          fontSize: 12 
                        }} 
                      />
                      <Area type="monotone" dataKey="rice" stroke="hsl(var(--primary))" fill="url(#riceGrad)" strokeWidth={3} />
                      <Area type="monotone" dataKey="wheat" stroke="hsl(var(--sun-gold))" fill="url(#wheatGrad)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={fadeIn} className="glass-card !p-0 overflow-hidden">
                <div className="p-6 pb-0">
                  <p className="label-mono mb-1">Distribution</p>
                  <p className="text-lg font-bold text-foreground">Crop Mix</p>
                </div>
                <div className="h-52 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie 
                        data={cropDistribution} 
                        cx="50%" 
                        cy="50%" 
                        innerRadius={55} 
                        outerRadius={75} 
                        paddingAngle={5} 
                        dataKey="value"
                        stroke="none"
                      >
                        {cropDistribution.map((entry, i) => (
                          <Cell key={i} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))",
                          borderRadius: 12, 
                          border: "1px solid hsl(var(--border))", 
                          boxShadow: "var(--shadow-elevated)", 
                          fontSize: 12 
                        }} 
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="px-6 pb-6 grid grid-cols-2 gap-3">
                  {cropDistribution.map((c) => (
                    <div key={c.name} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                      <span className="text-[10px] text-muted-foreground">{c.name} ({c.value}%)</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div variants={fadeIn} className="grid lg:grid-cols-3 gap-4">
              <div className="glass-card !p-0 overflow-hidden">
                <div className="p-5 pb-0 flex items-center justify-between">
                  <div>
                    <p className="label-mono mb-1">Weather</p>
                    <p className="text-lg font-bold text-foreground">7-Day Forecast</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {user?.location || "Hyderabad, IN"}
                  </div>
                </div>
                <div className="h-48 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weatherData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(120, 10%, 90%)" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 46%)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 46%)" />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }} />
                      <Bar dataKey="rain" fill="hsl(200, 80%, 55%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="temp" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="stat-card !p-0 overflow-hidden">
                <div className="p-5 pb-3">
                  <p className="label-mono mb-1">Activity</p>
                  <p className="text-lg font-bold text-foreground">Recent Events</p>
                </div>
                <div className="px-5 pb-4 space-y-3">
                  {activityList.map((a: ActivityItem, i: number) => {
                    const IconComponent = ACTIVITY_ICONS[a.icon] ?? Activity;
                    return (
                      <div key={i} className="flex items-start gap-3 group">
                        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                          <IconComponent className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{a.action}</p>
                          <p className="text-[10px] text-muted-foreground">{a.crop}</p>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mandi Connect Widget */}
              <div className="stat-card !p-0 overflow-hidden relative">
                <div className="p-5 pb-3 flex items-center justify-between">
                  <div>
                    <p className="label-mono mb-1 text-emerald-600 dark:text-emerald-400">Mandi-Connect</p>
                    <p className="text-lg font-bold text-foreground">Live Rates</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Store className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <div className="px-5 pb-2 text-xs text-muted-foreground flex items-center justify-between border-b border-border/50">
                  <span>Crop Base (Quintal)</span>
                  <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3"/>{marketData?.location || "Regional API"}</span>
                </div>
                <div className="px-5 py-3 space-y-3 relative z-10">
                  {marketData?.prices?.slice(0, 4).map((p, i) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${p.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'} flex items-center justify-center`}>
                           {p.trend === 'up' ? <ArrowUpRight className="w-4 h-4"/> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">{p.crop}</p>
                          <p className={`text-[10px] font-bold ${p.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {p.trend === 'up' ? '+' : '-'}{p.changePct}%
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold tabular-nums">₹{p.pricePerQuintal.toLocaleString()}</p>
                        <p className="text-[10px] text-muted-foreground">per qtl</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 pb-5 pt-2">
                   <div className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow">
                     <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                       <Wallet className="w-4 h-4" />
                     </div>
                     <div>
                       <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Income Predictor AI</h4>
                       <p className="text-[10px] text-muted-foreground">Tap to match yields to market prices.</p>
                     </div>
                   </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
    </>
  );
};

export default Dashboard;
