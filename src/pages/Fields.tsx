import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Plus,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  Grid3X3,
  List,
  Sprout,
  ArrowUpDown,
  Activity,
  Calendar,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { api, type Field } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const CROP_SYMBOLS: Record<string, string> = {
  Rice: "🌾",
  Wheat: "🌾",
  Maize: "🌽",
  Cotton: "☁️",
  Sugarcane: "🎋",
  Other: "🌱",
};
const CROPS = Object.keys(CROP_SYMBOLS);

const CROP_COLORS: Record<string, string> = {
  Rice: "bg-emerald-500/15 text-emerald-700 border-emerald-200",
  Wheat: "bg-amber-500/15 text-amber-700 border-amber-200",
  Maize: "bg-orange-500/15 text-orange-700 border-orange-200",
  Cotton: "bg-sky-500/15 text-sky-700 border-sky-200",
  Sugarcane: "bg-lime-500/15 text-lime-700 border-lime-200",
  Other: "bg-slate-500/15 text-slate-700 border-slate-200",
};

type SortOption = "name-az" | "name-za" | "area-high" | "area-low" | "newest" | "oldest";

export default function Fields() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [location, setLocation] = useState("");
  const [cropType, setCropType] = useState("Rice");
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const queryClient = useQueryClient();

  const { data: fields = [], isLoading } = useQuery({
    queryKey: ["fields"],
    queryFn: () => api.fields.list(),
  });

  const createMutation = useMutation({
    mutationFn: (body: { name: string; area: string; location: string; cropType?: string }) =>
      api.fields.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields"] });
      setDialogOpen(false);
      setName("");
      setArea("");
      setLocation("");
      toast.success("Field added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.fields.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields"] });
      toast.success("Field removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !area.trim() || !location.trim()) {
      toast.error("Name, area, and location are required");
      return;
    }
    createMutation.mutate({ name: name.trim(), area: area.trim(), location: location.trim(), cropType });
  };

  const filteredAndSorted = useMemo(() => {
    let list = [...fields];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.location.toLowerCase().includes(q) ||
          f.cropType.toLowerCase().includes(q)
      );
    }
    if (cropFilter) list = list.filter((f) => f.cropType === cropFilter);
    if (sort === "name-az") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "name-za") list.sort((a, b) => b.name.localeCompare(a.name));
    else if (sort === "area-high") list.sort((a, b) => parseFloat(b.area) - parseFloat(a.area));
    else if (sort === "area-low") list.sort((a, b) => parseFloat(a.area) - parseFloat(b.area));
    else if (sort === "newest") list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sort === "oldest") list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return list;
  }, [fields, search, cropFilter, sort]);

  const totalArea = useMemo(
    () => fields.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0).toFixed(1),
    [fields]
  );
  const cropCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    fields.forEach((f) => {
      counts[f.cropType] = (counts[f.cropType] ?? 0) + 1;
    });
    return counts;
  }, [fields]);

  return (
    <>
      <div className="space-y-6">
        {/* Stats */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <motion.div variants={fadeIn} className="glass-card flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-black tabular-nums tracking-tighter text-foreground">{fields.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Active Fields</p>
            </div>
          </motion.div>
          <motion.div variants={fadeIn} className="glass-card flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 shadow-inner">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-black tabular-nums tracking-tighter text-foreground">{totalArea}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Hectares</p>
            </div>
          </motion.div>
          <motion.div variants={fadeIn} className="glass-card flex items-center gap-4 p-5 col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 shadow-inner">
              <Sprout className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-black tabular-nums tracking-tighter text-foreground">{Object.keys(cropCounts).length}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Diversification</p>
            </div>
          </motion.div>
          <motion.div variants={fadeIn} className="flex items-center justify-center col-span-2 lg:col-span-1">
            <Button
              className="gradient-hero text-primary-foreground border-0 w-full h-full rounded-2xl shadow-lg hover:shadow-primary/20 transition-all font-bold text-sm"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" />
              New Estate
            </Button>
          </motion.div>
        </motion.div>

        {/* Search, filter, sort, view */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="flex flex-wrap items-center gap-3"
        >
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, location, crop..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" /> Crop:
          </span>
          <Button
            variant={cropFilter === null ? "secondary" : "ghost"}
            size="sm"
            className="text-xs h-8"
            onClick={() => setCropFilter(null)}
          >
            All
          </Button>
          {CROPS.map((c) => (
            <Button
              key={c}
              variant={cropFilter === c ? "secondary" : "ghost"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setCropFilter(cropFilter === c ? null : c)}
            >
              {CROP_SYMBOLS[c]} {c}
            </Button>
          ))}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
            <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
              <SelectTrigger className="w-[140px] h-9 text-xs">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="name-az">Name A–Z</SelectItem>
                <SelectItem value="name-za">Name Z–A</SelectItem>
                <SelectItem value="area-high">Area (high)</SelectItem>
                <SelectItem value="area-low">Area (low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex rounded-lg border border-border p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
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
          </div>
        </motion.div>

        {/* Add Field Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Field</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div>
                <Label>Field name</Label>
                <Input placeholder="e.g. North Paddy" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <Label>Area (hectares)</Label>
                <Input type="text" placeholder="e.g. 2.5" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
              <div>
                <Label>Location</Label>
                <Input placeholder="e.g. Hyderabad, IN" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
              <div>
                <Label>Crop type</Label>
                <Select value={cropType} onValueChange={setCropType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CROPS.map((c) => (
                      <SelectItem key={c} value={c}>{CROP_SYMBOLS[c]} {c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Field"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className={cn("gap-4", viewMode === "grid" ? "grid md:grid-cols-2 lg:grid-cols-3" : "space-y-2")}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="stat-card h-28 animate-pulse bg-muted/50 rounded-xl" />
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="stat-card text-center py-16 rounded-2xl border-2 border-dashed border-muted"
          >
            <MapPin className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground">
              {fields.length === 0 ? "No fields yet" : "No fields match your search"}
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {fields.length === 0
                ? "Add your first field to start tracking locations and linking predictions."
                : "Try a different search or filter."}
            </p>
            {fields.length === 0 && (
              <Button className="mt-4 gradient-hero text-primary-foreground" onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add your first field
              </Button>
            )}
          </motion.div>
        ) : viewMode === "list" ? (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredAndSorted.map((f, i) => (
                <FieldCard
                  key={f.id}
                  field={f}
                  index={i}
                  onDelete={() => deleteMutation.mutate(f.id)}
                  isDeleting={deleteMutation.isPending}
                  layout="list"
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredAndSorted.map((f, i) => (
                <FieldCard
                  key={f.id}
                  field={f}
                  index={i}
                  onDelete={() => deleteMutation.mutate(f.id)}
                  isDeleting={deleteMutation.isPending}
                  layout="grid"
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}

function FieldCard({
  field,
  index,
  onDelete,
  isDeleting,
  layout,
}: {
  field: Field;
  index: number;
  onDelete: () => void;
  isDeleting: boolean;
  layout: "grid" | "list";
}) {
  const cropColor = CROP_COLORS[field.cropType] ?? CROP_COLORS.Other;
  const healthScore = 85; // Simulated
  const healthColor = healthScore > 80 ? "bg-emerald-500" : (healthScore > 60 ? "bg-amber-500" : "bg-destructive");
  
  const addedDate = new Date(field.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        "group glass-card rounded-2xl transition-all duration-300 relative overflow-hidden",
        layout === "list" ? "flex-row items-center" : "flex-col"
      )}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
      
      <Collapsible className="flex-1 min-w-0 p-5">
        <CollapsibleTrigger asChild>
          <button type="button" className="group flex-1 text-left w-full relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-muted/30 flex items-center justify-center text-2xl shadow-inner border border-border/50">
                  {CROP_SYMBOLS[field.cropType] || "🌱"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-black text-foreground uppercase tracking-tight truncate">{field.name}</h4>
                    <Badge variant="outline" className={cn("text-[9px] h-4 font-bold uppercase tracking-wider", cropColor)}>
                      {field.cropType}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium italic">
                    <MapPin className="w-3 h-3 text-primary/70" /> {field.location}
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <p className="text-xl font-black tabular-nums tracking-tighter text-foreground leading-none">{field.area}</p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Hectares</p>
              </div>
            </div>

            {layout === "grid" && (
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
                  <span className="flex items-center gap-1.5"><Activity className="w-3 h-3 text-primary" /> Health Index</span>
                  <span className="text-foreground">{healthScore}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-muted/30 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${healthScore}%` }}
                    className={cn("h-full transition-all duration-500", healthColor)} 
                  />
                </div>
              </div>
            )}

            <div className="mt-4 flex items-center justify-center">
              <ChevronDown className="w-4 h-4 text-muted-foreground/40 transition-transform duration-300 group-data-[state=open]:rotate-180" />
            </div>
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-6 mt-6 border-t border-border/50 space-y-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Rotation Heritage</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm border border-primary/20">
                    {CROP_SYMBOLS[field.cropType]}
                  </div>
                  <div className="w-px h-4 bg-border/50 my-1" />
                  <div className="w-6 h-6 rounded-md bg-muted/30 flex items-center justify-center text-xs opacity-50">
                    🌽
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-foreground">Current: {field.cropType}</p>
                    <p className="text-[9px] text-muted-foreground">{addedDate} — Present</p>
                  </div>
                  <div className="opacity-50">
                    <p className="text-[10px] font-medium text-muted-foreground">Previous: Maize</p>
                    <p className="text-[9px] text-muted-foreground">Oct 2025 — Mar 2026</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-primary/5 border border-primary/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-3 h-3 text-primary" />
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Management Insight</p>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed italic">
                Suggesting a <span className="text-foreground font-bold not-italic">Legume rotation</span> in next season to restore nitrogen levels efficiently.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 rounded-xl text-[10px] font-bold uppercase text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" 
                onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                disabled={isDeleting}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Retire Field
              </Button>
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
}

