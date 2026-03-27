import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Check,
  Trash2,
  Sprout,
  Wheat,
  Droplets,
  FlaskConical,
  MoreHorizontal,
  List,
  CalendarDays,
  Filter,
  Zap,
  TrendingUp,
  Target,
  BarChart3,
  ShieldCheck,
  BrainCircuit,
  PieChart,
} from "lucide-react";
import { fadeIn, staggerContainer } from "@/lib/animations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, type PlanningTask } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const TASK_TYPES = [
  { value: "planting", label: "Planting", icon: Sprout, color: "#10b981", light: "bg-emerald-500/15 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  { value: "harvest", label: "Harvest", icon: Wheat, color: "#f59e0b", light: "bg-amber-500/15 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  { value: "irrigation", label: "Irrigation", icon: Droplets, color: "#0ea5e9", light: "bg-sky-500/15 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  { value: "fertilizer", label: "Fertilizer", icon: FlaskConical, color: "#f97316", light: "bg-orange-500/15 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  { value: "other", label: "Other", icon: MoreHorizontal, color: "#64748b", light: "bg-slate-500/15 text-slate-700 border-slate-200", dot: "bg-slate-500" },
];

function getTypeConfig(type: string) {
  return TASK_TYPES.find((t) => t.value === type) ?? TASK_TYPES[TASK_TYPES.length - 1];
}

function getTypeColor(type: string): string {
  return getTypeConfig(type).color;
}

function getDueBadge(dueDate: string) {
  const d = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return { label: "Overdue", className: "bg-red-500/15 text-red-700 border-red-200" };
  if (diff === 0) return { label: "Today", className: "bg-primary/15 text-primary border-primary/30" };
  if (diff === 1) return { label: "Tomorrow", className: "bg-blue-500/15 text-blue-700 border-blue-200" };
  if (diff <= 7) return { label: "This week", className: "bg-violet-500/15 text-violet-700 border-violet-200" };
  return { label: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }), className: "bg-muted text-muted-foreground border-border" };
}

function getCountdown(dueDate: string) {
  const d = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return `${Math.abs(diff)} day(s) overdue`;
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  return `In ${diff} days`;
}

export default function Planning() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("planting");
  const [dueDate, setDueDate] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "week">("list");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["planning"],
    queryFn: () => api.planning.list(),
  });

  const createMutation = useMutation({
    mutationFn: (body: { title: string; type: string; dueDate: string }) =>
      api.planning.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
      setDialogOpen(false);
      setTitle("");
      setDueDate("");
      toast.success("Task added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: string) => api.planning.toggle(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["planning"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.planning.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planning"] });
      toast.success("Task removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openDialogWithType = (presetType: string) => {
    setType(presetType);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) {
      toast.error("Title and due date are required");
      return;
    }
    createMutation.mutate({ title: title.trim(), type, dueDate });
  };

  const upcoming = useMemo(() => tasks.filter((t) => !t.completed), [tasks]);
  const completed = useMemo(() => tasks.filter((t) => t.completed), [tasks]);

  const filteredUpcoming = useMemo(
    () => (typeFilter ? upcoming.filter((t) => t.type === typeFilter) : upcoming),
    [upcoming, typeFilter]
  );
  const filteredCompleted = useMemo(
    () => (typeFilter ? completed.filter((t) => t.type === typeFilter) : completed),
    [completed, typeFilter]
  );

  const weekDays = useMemo(() => {
    const days = [];
    const start = new Date();
    start.setDate(start.getDate() - start.getDay());
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const tasksByDay = useMemo(() => {
    const map: Record<string, PlanningTask[]> = {};
    weekDays.forEach((d) => {
      const key = d.toISOString().slice(0, 10);
      map[key] = upcoming.filter((t) => t.dueDate.slice(0, 10) === key);
    });
    return map;
  }, [weekDays, upcoming]);

  // Strategy Data
  const resourceAllocation = [
    { name: "Fertilizer", value: 35, color: "hsl(var(--primary))" },
    { name: "Irrigation", value: 25, color: "#0ea5e9" },
    { name: "Labor", value: 20, color: "#f59e0b" },
    { name: "Seeds", value: 20, color: "#10b981" },
  ];

  const seasonProgress = 68; // %

  return (
    <>
      <div className="space-y-6">
        {/* Strategy Lab Header */}
        <motion.div variants={fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Strategic Intelligence</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
              PLANNING <span className="text-primary/80">& FORCECAST</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-2 font-medium">Dynamic agricultural logistics and resource optimization lab</p>
          </div>
          <Button
            className="gradient-hero text-primary-foreground border-0 h-12 px-8 rounded-2xl shadow-lg hover:shadow-primary/20 transition-all font-bold"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            Initialize Task
          </Button>
        </motion.div>

        {/* Strategy & Metrics Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Main Insight: Season Pulse */}
          <motion.div variants={fadeIn} className="lg:col-span-2 glass-panel p-8 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <p className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Season Progress</p>
                  <p className="text-2xl font-black text-foreground">Kharif Cycle '26</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-primary tracking-tighter">{seasonProgress}%</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Estimated Completion</p>
                </div>
              </div>

              <div className="w-full h-3 rounded-full bg-muted/30 overflow-hidden mb-10 border border-border/50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${seasonProgress}%` }}
                  className="h-full bg-gradient-to-r from-primary/80 to-primary" 
                />
              </div>

              <div className="grid grid-cols-3 gap-6 pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Elapsed</span>
                  </div>
                  <p className="text-lg font-black tabular-nums">124 <span className="text-xs font-normal">Days</span></p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Yield Est.</span>
                  </div>
                  <p className="text-lg font-black tabular-nums">+12% <span className="text-xs font-normal text-emerald-500">↑</span></p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="text-[9px] font-bold uppercase tracking-wider">Risk Level</span>
                  </div>
                  <p className="text-lg font-black text-emerald-500">LOW</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Allocation Breakdown */}
          <motion.div variants={fadeIn} className="glass-panel p-8">
            <p className="text-xs font-black text-sun-gold uppercase tracking-[0.2em] mb-6">Resource Sync</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={resourceAllocation} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }} 
                    width={70}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: 12, border: 'none', backgroundColor: 'hsl(var(--background)/0.9)', backdropFilter: 'blur(8px)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {resourceAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-3 rounded-xl bg-sun-gold/5 border border-sun-gold/10">
              <p className="text-[10px] text-muted-foreground font-medium italic text-center leading-relaxed">
                Strategic focus: <span className="text-sun-gold font-bold">Fertilization efficiency</span> is currently optimal.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick add + Filters + View toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-3"
        >
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" /> Quick add:
          </span>
          {TASK_TYPES.map((t) => (
            <Button
              key={t.value}
              variant="outline"
              size="sm"
              className={cn("text-xs h-8", getTypeConfig(t.value).light)}
              onClick={() => openDialogWithType(t.value)}
            >
              <t.icon className="w-3 h-3 mr-1" />
              {t.label}
            </Button>
          ))}
          <span className="w-px h-6 bg-border mx-1" />
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <Button
            variant={typeFilter === null ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-8"
            onClick={() => setTypeFilter(null)}
          >
            All
          </Button>
          {TASK_TYPES.map((t) => (
            <Button
              key={t.value}
              variant={typeFilter === t.value ? "secondary" : "ghost"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setTypeFilter(typeFilter === t.value ? null : t.value)}
            >
              {t.label}
            </Button>
          ))}
          <span className="w-px h-6 bg-border mx-1" />
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              title="List view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("week")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "week" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              title="Week view"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Add Task Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <Label>Title</Label>
                <Input placeholder="e.g. Rice planting - North field" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <span className="flex items-center gap-2">
                          <t.icon className="w-3.5 h-3.5" /> {t.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Task"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="stat-card h-20 animate-pulse bg-muted/50 rounded-xl" />
            ))}
          </div>
        ) : viewMode === "week" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-7 gap-2"
          >
            {weekDays.map((d, i) => {
              const key = d.toISOString().slice(0, 10);
              const dayTasks = tasksByDay[key] ?? [];
              const isToday = key === new Date().toISOString().slice(0, 10);
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={cn(
                    "rounded-xl border p-3 min-h-[140px]",
                    isToday ? "border-primary bg-primary/5" : "border-border bg-card"
                  )}
                >
                  <p className={cn("text-xs font-semibold mb-2", isToday ? "text-primary" : "text-muted-foreground")}>
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </p>
                  <p className="text-lg font-bold tabular-nums">{d.getDate()}</p>
                  <div className="mt-2 space-y-1.5">
                    {dayTasks.slice(0, 3).map((t) => {
                      const config = getTypeConfig(t.type);
                      return (
                        <div
                          key={t.id}
                          className={cn("text-[10px] font-medium px-2 py-1 rounded-md truncate border-l-2", config.light)}
                          style={{ borderLeftColor: config.color }}
                        >
                          <span className="truncate block">{t.title}</span>
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <p className="text-[10px] text-muted-foreground">+{dayTasks.length - 3} more</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <Tabs defaultValue="upcoming" className="space-y-4">
            <TabsList className="bg-muted/50">
              <TabsTrigger value="upcoming">
                Upcoming ({filteredUpcoming.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({filteredCompleted.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="space-y-3 mt-4">
              {filteredUpcoming.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="stat-card text-center py-12 rounded-2xl border-2 border-dashed border-muted"
                >
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">No upcoming tasks</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {typeFilter ? "Try changing the filter or add a new task." : "Hit Add Task or use Quick add above."}
                  </p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredUpcoming.map((t, i) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      index={i}
                      onToggle={() => toggleMutation.mutate(t.id)}
                      onDelete={() => deleteMutation.mutate(t.id)}
                    />
                  ))}
                </AnimatePresence>
              )}
            </TabsContent>
            <TabsContent value="completed" className="space-y-3 mt-4">
              {filteredCompleted.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="stat-card text-center py-12 rounded-2xl border-2 border-dashed border-muted"
                >
                  <Check className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium text-foreground">No completed tasks yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Complete tasks from the Upcoming tab.</p>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredCompleted.map((t, i) => (
                    <TaskRow
                      key={t.id}
                      task={t}
                      index={i}
                      onToggle={() => toggleMutation.mutate(t.id)}
                      onDelete={() => deleteMutation.mutate(t.id)}
                      isCompleted
                    />
                  ))}
                </AnimatePresence>
              )}
            </TabsContent>
          </Tabs>
        )}

        {tasks.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="stat-card text-center py-16 rounded-2xl"
          >
            <Calendar className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground">No tasks yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              Use Quick add above or Add Task to schedule planting, harvest, irrigation, and more.
            </p>
            <Button className="mt-4 gradient-hero text-primary-foreground" onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add your first task
            </Button>
          </motion.div>
        )}
      </div>
    </>
  );
}

function TaskRow({
  task,
  index,
  onToggle,
  onDelete,
  isCompleted = false,
}: {
  task: PlanningTask;
  index: number;
  onToggle: () => void;
  onDelete: () => void;
  isCompleted?: boolean;
}) {
  const config = getTypeConfig(task.type);
  const dueBadge = getDueBadge(task.dueDate);
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "group glass-card flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 relative overflow-hidden",
        task.completed ? "opacity-60 grayscale-[0.5]" : "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
      )}
    >
      <div className="absolute top-0 left-0 w-1.5 h-full opacity-40" style={{ backgroundColor: config.color }} />
      
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all duration-300",
          task.completed 
            ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
            : "border-muted-foreground/20 hover:border-primary hover:bg-primary/5"
        )}
      >
        {task.completed ? <Check className="w-5 h-5" strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-muted-foreground/20 group-hover:bg-primary/40" />}
      </button>

      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-bold text-foreground transition-all duration-300",
          task.completed && "line-through text-muted-foreground"
        )}>
          {task.title}
        </h4>
        <div className="flex flex-wrap items-center gap-3 mt-1.5">
          <Badge className={cn("text-[9px] font-black uppercase tracking-wider h-5 border-0", config.light)}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
          <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-wider h-5 border-border/50", dueBadge.className)}>
            {dueBadge.label}
          </Badge>
          {!task.completed && (
            <span className="text-[10px] text-muted-foreground font-medium italic">{getCountdown(task.dueDate)}</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
