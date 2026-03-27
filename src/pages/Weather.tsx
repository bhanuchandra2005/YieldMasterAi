import { motion } from "framer-motion";
import {
  CloudRain,
  Thermometer,
  Droplets,
  Wind,
  MapPin,
  Gauge,
  Cloud,
  Sun,
  CloudDrizzle,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api, type WeatherData } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { fadeIn, staggerContainer } from "@/lib/animations";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function getConditionIcon(condition: string) {
  const c = condition?.toLowerCase() ?? "";
  if (c.includes("rain") || c.includes("shower")) return CloudRain;
  if (c.includes("drizzle")) return CloudDrizzle;
  if (c.includes("sunny") || c.includes("clear")) return Sun;
  return Cloud;
}

export default function Weather() {
  const { data, isLoading } = useQuery({
    queryKey: ["weather"],
    queryFn: () => api.weather.get(),
  });

  if (isLoading || !data) {
    return (
      <>
        <div className="weather-observatory weather-observatory--light relative min-h-[60vh] rounded-2xl p-6">
          <div className="weather-fog" />
          <div className="weather-particles" />
          <div className="relative space-y-6">
            <div className="weather-glass-panel h-56 animate-pulse rounded-2xl" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="weather-glass-panel h-32 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  const w = data as WeatherData;
  const { current, forecast, location } = w;
  const pressure = current.pressure ?? 1013;

  // Agricultural Indices Simulation
  const gdd = 24.5; // Growing Degree Days
  const soilMoistureIndex = 72; // %
  const evapotranspiration = 4.2; // mm/day

  return (
    <>
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="weather-observatory weather-observatory--light relative min-h-[85vh] rounded-3xl p-6 md:p-10 overflow-hidden border border-border/50 shadow-sm"
      >
        {/* Ambient Effects - Subtle for professional look */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10 pointer-events-none" />
        
        <div className="relative space-y-8">
          {/* Header Section - Cleaned up */}
          <motion.div variants={fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/10 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/80">Weather Intelligence</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                Meteorological <span className="text-primary">Analysis</span>
              </h2>
              <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground font-semibold bg-white/80 dark:bg-muted/30 w-fit px-4 py-1.5 rounded-2xl border border-border/40 shadow-sm">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Monitoring Station: <span className="text-foreground">{location}</span></span>
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="glass-card px-5 py-2.5 border-primary/10 bg-white/50 dark:bg-primary/5 shadow-sm">
                <span className="text-[9px] font-bold text-muted-foreground uppercase block mb-1 tracking-wider">System Status</span>
                <span className="text-xs font-extra-bold text-primary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  ONLINE / STABLE
                </span>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Primary Display: Current Weather */}
            <motion.div variants={fadeIn} className="lg:col-span-2 glass-panel p-10 relative overflow-hidden group border border-border/20 shadow-md bg-white/80 dark:bg-card/40">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sun className="w-40 h-40 text-sun-gold animate-spin-slow" />
              </div>

              <div className="relative">
                <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-10 opacity-70">Atmospheric Dynamics</p>
                
                <div className="flex flex-wrap items-center gap-12 md:gap-20">
                  <div className="flex items-center gap-8">
                    <div className="w-24 h-24 rounded-[2rem] bg-primary/5 flex items-center justify-center shadow-sm border border-primary/10 transition-transform group-hover:scale-105 duration-500">
                      <Thermometer className="h-12 w-12 text-primary" strokeWidth={1} />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-1">
                        <p className="text-8xl font-black tabular-nums tracking-tighter text-foreground leading-none">{current.temp}</p>
                        <span className="text-4xl font-light text-primary/60">°C</span>
                      </div>
                      <p className="text-xl font-semibold text-muted-foreground mt-3 flex items-center gap-3">
                        {current.condition} 
                        <span className="w-2 h-2 rounded-full bg-sun-gold" />
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-10 border-l border-border/20 pl-12 md:pl-20">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Droplets className="h-4 w-4 text-sky-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Humidity</span>
                      </div>
                      <p className="text-2xl font-bold tabular-nums text-foreground">{current.humidity}%</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Wind className="h-4 w-4 text-emerald-500" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Wind Speed</span>
                      </div>
                      <p className="text-2xl font-bold tabular-nums text-foreground">{current.wind} <span className="text-sm font-medium opacity-60">km/h</span></p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <Gauge className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Pressure</span>
                      </div>
                      <p className="text-2xl font-bold tabular-nums text-foreground">{pressure} <span className="text-sm font-medium opacity-60">hPa</span></p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Side Display: Agricultural Index */}
            <motion.div variants={fadeIn} className="glass-panel p-10 flex flex-col justify-center border border-border/20 bg-white/60 dark:bg-card/30">
              <p className="text-[10px] font-bold text-sun-gold uppercase tracking-[0.2em] mb-10 opacity-70">Agronomic Indicators</p>
              
              <div className="space-y-8">
                <div className="flex items-center justify-between group cursor-help p-2 rounded-xl hover:bg-white dark:hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sun-gold/5 flex items-center justify-center border border-sun-gold/10">
                      <Sun className="w-5 h-5 text-sun-gold" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">GDD (Growing Deg.)</span>
                  </div>
                  <span className="text-xl font-bold tabular-nums text-foreground">{gdd}</span>
                </div>
                
                <div className="flex items-center justify-between group cursor-help p-2 rounded-xl hover:bg-white dark:hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                      <Droplets className="w-5 h-5 text-emerald-500" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">Soil Moisture</span>
                  </div>
                  <span className="text-xl font-bold tabular-nums text-foreground">{soilMoistureIndex}%</span>
                </div>
                
                <div className="flex items-center justify-between group cursor-help p-2 rounded-xl hover:bg-white dark:hover:bg-muted/10 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/5 flex items-center justify-center border border-sky-500/10">
                      <CloudRain className="w-5 h-5 text-sky-500" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground">Evapotranspiration</span>
                  </div>
                  <span className="text-xl font-bold tabular-nums text-foreground">{evapotranspiration} <span className="text-xs font-medium opacity-50">mm</span></span>
                </div>
              </div>

              <div className="mt-12 p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-inner">
                <p className="text-xs text-muted-foreground font-medium italic text-center leading-relaxed">
                  Weather conditions are presently <span className="text-primary font-bold">ideal</span> for vegetative growth optimization.
                </p>
              </div>
            </motion.div>
          </div>

          {/* 7-day Historical / Forecast Trend */}
          <motion.div variants={fadeIn} className="glass-panel p-10 border border-border/20 bg-white/80 dark:bg-card/40 shadow-md">
            <div className="flex items-center justify-between mb-10">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] opacity-70">Weekly Atmosphere Projection</p>
              <div className="flex gap-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Temperature</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Precipitation</span>
                </div>
              </div>
            </div>
            
            <div className="h-72 mt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.2)" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
                    dy={10} 
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "rgba(255, 255, 255, 0.95)", 
                      backdropFilter: 'blur(12px)',
                      borderRadius: 16, 
                      border: "1px solid hsl(var(--border))",
                      boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)',
                      padding: '12px 16px'
                    }}
                    itemStyle={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temp" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    fillOpacity={1} 
                    fill="url(#colorTemp)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rain" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                    fillOpacity={1} 
                    fill="url(#colorRain)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Forecast Grid */}
          <motion.div variants={fadeIn} className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-5">
            {forecast.map((day, i) => {
              const Icon = getConditionIcon(day.condition);
              const isToday = i === 0;
              return (
                <motion.div
                  key={day.day}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={cn(
                    "glass-card p-6 group flex flex-col items-center text-center transition-all duration-500 border border-border/20",
                    isToday ? "ring-2 ring-primary/20 bg-primary/5 dark:bg-primary/10 shadow-xl" : "bg-white/40 dark:bg-card/20"
                  )}
                >
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
                    {day.day}
                  </p>
                  
                  <div className="w-14 h-14 rounded-2xl bg-muted/20 flex items-center justify-center mb-6 border border-border/10 transition-all group-hover:bg-primary group-hover:text-white duration-500 shadow-sm">
                    <Icon className="h-7 w-7 transition-transform group-hover:rotate-12" />
                  </div>
                  
                  <p className="text-3xl font-black tabular-nums tracking-tighter text-foreground mb-1">{day.temp}°</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-6 tracking-wide">{day.condition}</p>
                  
                  <div className="w-full pt-5 border-t border-border/10 flex flex-col gap-2.5">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                      <span className="text-muted-foreground opacity-60">Rain</span>
                      <span className="text-emerald-500">{day.rain}mm</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
