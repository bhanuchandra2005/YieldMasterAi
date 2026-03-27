import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Flame,
  TrendingUp,
  Zap,
  Crown,
  Sparkles,
  Calendar,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Dna,
  ChevronDown,
  GitCompare,
  Plus,
  Loader2,
  Trash2,
  X,
  Sprout,
  Info,
  Maximize2,
  Minimize2,
  Droplets,
  Thermometer,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { api, type Field, type Prediction, type PredictYieldInput } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { fadeIn, staggerContainer, scaleUp } from "@/lib/animations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  AreaChart,
  Area,
  Cell,
} from "recharts";

const CROP_SYMBOLS: Record<string, string> = {
  Rice: "🌾",
  Wheat: "🌾",
  Maize: "🌽",
  Cotton: "☁️",
  Sugarcane: "🎋",
  Other: "🌱",
};
const CROPS = Object.keys(CROP_SYMBOLS);

const SOIL_SYMBOLS: Record<string, string> = {
  Loam: "🪴",
  Clay: "🏺",
  Sandy: "🏜️",
  Silt: "🌫️",
  "Loamy Clay": "🧉",
};
const SOIL_TYPES = Object.keys(SOIL_SYMBOLS);
const IRRIGATION_TYPES = ["Drip", "Sprinkler", "Flood", "None"];

const ConfidenceGauge = ({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) => {
  const percentage = Math.round(score * 100);
  const color = score > 0.8 ? "text-primary" : score > 0.5 ? "text-sun-gold" : "text-destructive";
  const strokeColor = score > 0.8 ? "hsl(var(--primary))" : score > 0.5 ? "hsl(var(--sun-gold))" : "hsl(var(--destructive))";
  
  const dimensions = {
    sm: { size: 40, stroke: 3, font: "text-[10px]" },
    md: { size: 80, stroke: 6, font: "text-lg" },
    lg: { size: 120, stroke: 8, font: "text-2xl" }
  }[size];

  const radius = (dimensions.size - dimensions.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={dimensions.size} height={dimensions.size} className="transform -rotate-90">
        <circle
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={dimensions.stroke}
          fill="transparent"
          className="text-muted/20"
        />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
          cx={dimensions.size / 2}
          cy={dimensions.size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={dimensions.stroke}
          strokeDasharray={circumference}
          fill="transparent"
          strokeLinecap="round"
        />
      </svg>
      <span className={cn("absolute font-black tracking-tight", color, dimensions.font)}>
        {percentage}%
      </span>
    </div>
  );
};

interface PredictionForm extends Omit<PredictYieldInput, 'fieldSizeHa' | 'soilMoisture' | 'temperature' | 'rainfall' | 'humidity' | 'fertilizerUsed' | 'pestIncidents'> {
  fieldName?: string;
  fieldSizeHa?: string;
  fieldId?: string;
  soilMoisture?: string;
  temperature?: string;
  rainfall?: string;
  humidity?: string;
  fertilizerUsed: string; // "yes" | "no"
  pestIncidents: string;   // "yes" | "no"
}

const defaultForm: PredictionForm = {
  fieldId: undefined,
  fieldName: "",
  fieldSizeHa: "",
  soilType: "",
  soilMoisture: "",
  cropType: "Rice",
  variety: "",
  plantingDate: "",
  temperature: "",
  rainfall: "",
  humidity: "",
  fertilizerUsed: "no",
  irrigationType: "",
  pestIncidents: "no",
};

export default function Predictions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const openNew = searchParams.get("new") === "1";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [wizardStep, setWizardStep] = useState(1);
  const [step, setStep] = useState<"form" | "running" | "result">("form");
  const [aiStep, setAiStep] = useState(0);
  const [result, setResult] = useState<(Prediction & { suggestedImprovements?: string[] }) | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const WIZARD_STEPS = ["Field", "Crop", "Environment", "Management"];
  const AI_STEPS = [
    "Collecting field data",
    "Analyzing soil conditions",
    "Processing weather data",
    "Running AI yield model",
    "Generating prediction",
  ];

  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ["predictions"],
    queryFn: () => api.predictions.list(),
  });
  const { data: fields = [] } = useQuery({
    queryKey: ["fields"],
    queryFn: () => api.fields.list(),
  });

  useEffect(() => {
    if (openNew) setDialogOpen(true);
  }, [openNew]);

  const predictMutation = useMutation({
    mutationFn: (body: PredictYieldInput) => api.predictions.predictYield(body),
    onSuccess: (data) => {
      setAiStep(5);
      setTimeout(() => {
        setResult(data);
        setStep("result");
        queryClient.invalidateQueries({ queryKey: ["predictions"] });
        toast.success("Prediction complete");
      }, 400);
    },
    onError: (e: Error) => {
      setStep("form");
      setAiStep(0);
      toast.error(e.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.predictions.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["predictions"] });
      setCompareIds((prev) => prev.filter((i) => i !== id));
      toast.success("Prediction deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const runPrediction = () => {
    if (!form.cropType) {
      toast.error("Crop type is required");
      return;
    }
    setAiStep(0);
    const payload: PredictYieldInput = {
      fieldId: form.fieldId || undefined,
      fieldName: form.fieldName || undefined,
      fieldSizeHa: form.fieldSizeHa ? parseFloat(form.fieldSizeHa) : undefined,
      soilType: form.soilType || undefined,
      soilMoisture: form.soilMoisture ? parseFloat(form.soilMoisture) : undefined,
      cropType: form.cropType,
      variety: form.variety || undefined,
      plantingDate: form.plantingDate || undefined,
      temperature: form.temperature ? parseFloat(form.temperature) : undefined,
      rainfall: form.rainfall ? parseFloat(form.rainfall) : undefined,
      humidity: form.humidity ? parseFloat(form.humidity) : undefined,
      fertilizerUsed: form.fertilizerUsed === "yes",
      irrigationType: form.irrigationType || undefined,
      pestIncidents: form.pestIncidents === "yes",
    };
    setStep("running");
    const steps = [0, 1, 2, 3, 4];
    steps.forEach((i, idx) => {
      setTimeout(() => setAiStep(i), idx * 600);
    });
    predictMutation.mutate(payload);
  };

  const closeModal = () => {
    setDialogOpen(false);
    setIsMaximized(false);
    setStep("form");
    setWizardStep(1);
    setAiStep(0);
    setResult(null);
    setForm(defaultForm);
    setSearchParams({});
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : prev.length < 2 ? [...prev, id] : [prev[1], id]
    );
  };

  const comparePredictions = compareIds.length === 2 ? predictions.filter((p) => compareIds.includes(p.id)) : [];

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
              Yield Predictions
            </h2>
            <p className="text-sm text-muted-foreground">AI-powered agricultural yield estimation engine</p>
          </div>
          <Button
            type="button"
            className="gradient-hero text-primary-foreground border-0 h-11 px-6 rounded-full hover:shadow-lg transition-all"
            onClick={() => setDialogOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Prediction
          </Button>
        </motion.div>

        {comparePredictions.length === 2 && (
          <CompareShowdown
            left={comparePredictions[0]}
            right={comparePredictions[1]}
            onClear={() => setCompareIds([])}
            toYieldNum={toYieldNum}
          />
        )}

        <Dialog open={dialogOpen} onOpenChange={(open) => !open && closeModal()}>
          <DialogContent 
            className={cn(
              "overflow-y-auto transition-all duration-300 ease-in-out",
              isMaximized 
                ? "max-w-[100vw] w-screen h-screen m-0 rounded-none border-none p-10 bg-background/95 backdrop-blur-xl" 
                : "sm:max-w-2xl max-h-[90vh]"
            )}
          >
            <div className="absolute top-4 right-12 z-50">
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg bg-muted/10 hover:bg-muted/30 text-muted-foreground/60 transition-all"
                onClick={() => setIsMaximized(!isMaximized)}
              >
                {isMaximized ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            </div>
            <DialogHeader>
              <DialogTitle>
                {step === "form" && "New AI Prediction"}
                {step === "running" && "Running prediction..."}
                {step === "result" && "Prediction result"}
              </DialogTitle>
            </DialogHeader>

            {step === "form" && (
              <div className="space-y-6">
                <div className="flex gap-2">
                  {WIZARD_STEPS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setWizardStep(i + 1)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-medium transition-all",
                        wizardStep === i + 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {i + 1}. {label}
                    </button>
                  ))}
                </div>
                <motion.div
                  key={wizardStep}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {wizardStep === 1 && (
                    <>
                      <div>
                        <Label>Link to existing field (optional)</Label>
                        <Select value={form.fieldId ?? "none"} onValueChange={(v) => setForm((f) => ({ ...f, fieldId: v === "none" ? undefined : v }))}>
                          <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {fields.map((f) => (<SelectItem key={f.id} value={f.id}>{f.name} – {f.location}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Field name</Label><Input placeholder="e.g. North Paddy" value={form.fieldName ?? ""} onChange={(e) => setForm((f) => ({ ...f, fieldName: e.target.value }))} /></div>
                        <div><Label>Field size (ha)</Label><Input type="number" step="0.1" placeholder="e.g. 2.5" value={form.fieldSizeHa ?? ""} onChange={(e) => setForm((f) => ({ ...f, fieldSizeHa: e.target.value }))} /></div>
                      </div>
                      <div><Label>Soil type</Label><Select value={form.soilType ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, soilType: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{SOIL_TYPES.map((s) => (<SelectItem key={s} value={s}>{SOIL_SYMBOLS[s]} {s}</SelectItem>))}</SelectContent></Select></div>
                      <div><Label>Soil moisture (%)</Label><Input type="number" min={0} max={100} placeholder="0–100" value={form.soilMoisture ?? ""} onChange={(e) => setForm((f) => ({ ...f, soilMoisture: e.target.value }))} /></div>
                    </>
                  )}
                  {wizardStep === 2 && (
                    <>
                      <div><Label>Crop type *</Label><Select value={form.cropType} onValueChange={(v) => setForm((f) => ({ ...f, cropType: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CROPS.map((c) => (<SelectItem key={c} value={c}>{CROP_SYMBOLS[c]} {c}</SelectItem>))}</SelectContent></Select></div>
                      <div><Label>Variety (optional)</Label><Input placeholder="e.g. IR64" value={form.variety ?? ""} onChange={(e) => setForm((f) => ({ ...f, variety: e.target.value }))} /></div>
                      <div><Label>Planting date</Label><Input type="date" value={form.plantingDate ?? ""} onChange={(e) => setForm((f) => ({ ...f, plantingDate: e.target.value }))} /></div>
                    </>
                  )}
                  {wizardStep === 3 && (
                    <>
                      <div><Label>Temperature (°C)</Label><Input type="number" step="0.1" placeholder="e.g. 28" value={form.temperature ?? ""} onChange={(e) => setForm((f) => ({ ...f, temperature: e.target.value }))} /></div>
                      <div><Label>Rainfall (mm)</Label><Input type="number" placeholder="e.g. 120" value={form.rainfall ?? ""} onChange={(e) => setForm((f) => ({ ...f, rainfall: e.target.value }))} /></div>
                      <div><Label>Humidity (%)</Label><Input type="number" min={0} max={100} placeholder="0–100" value={form.humidity ?? ""} onChange={(e) => setForm((f) => ({ ...f, humidity: e.target.value }))} /></div>
                    </>
                  )}
                  {wizardStep === 4 && (
                    <>
                      <div><Label>Fertilizer used</Label><Select value={form.fertilizerUsed} onValueChange={(v) => setForm((f) => ({ ...f, fertilizerUsed: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yes">Yes</SelectItem><SelectItem value="no">No</SelectItem></SelectContent></Select></div>
                      <div><Label>Irrigation type</Label><Select value={form.irrigationType ?? ""} onValueChange={(v) => setForm((f) => ({ ...f, irrigationType: v }))}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{IRRIGATION_TYPES.map((i) => (<SelectItem key={i} value={i}>{i}</SelectItem>))}</SelectContent></Select></div>
                      <div><Label>Pest incidents</Label><Select value={form.pestIncidents} onValueChange={(v) => setForm((f) => ({ ...f, pestIncidents: v }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="no">No</SelectItem><SelectItem value="yes">Yes</SelectItem></SelectContent></Select></div>
                    </>
                  )}
                </motion.div>
                <div className="flex justify-between pt-2">
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setWizardStep((s) => Math.max(1, s - 1))} disabled={wizardStep === 1}>Back</Button>
                    <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
                  </div>
                  {wizardStep < 4 ? (
                    <Button type="button" onClick={() => setWizardStep((s) => Math.min(4, s + 1))} disabled={wizardStep === 2 && !form.cropType}>Next</Button>
                  ) : (
                    <Button type="button" onClick={runPrediction} disabled={!form.cropType || predictMutation.isPending}>Run Prediction</Button>
                  )}
                </div>
              </div>
            )}

            {step === "running" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10 flex flex-col items-center gap-8">
                <Loader2 className="w-14 h-14 text-primary animate-spin" />
                <div className="space-y-2 w-full max-w-sm">
                  {AI_STEPS.map((label, i) => (
                    <div key={label} className={cn("flex items-center gap-3 py-2 px-3 rounded-lg transition-colors", aiStep >= i ? "bg-primary/10" : "bg-muted/50")}>
                      {aiStep > i ? <span className="text-primary">✓</span> : aiStep === i ? <Loader2 className="w-4 h-4 text-primary animate-spin" /> : <span className="w-4" />}
                      <span className={cn("text-sm", aiStep >= i ? "font-medium text-foreground" : "text-muted-foreground")}>{label}</span>
                    </div>
                  ))}
                </div>
                <div className="w-full max-w-xs">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div className="h-full bg-primary rounded-full" initial={{ width: "0%" }} animate={{ width: `${((aiStep + 1) / 5) * 100}%` }} transition={{ duration: 0.3 }} />
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">{Math.round(((aiStep + 1) / 5) * 100)}%</p>
                </div>
              </motion.div>
            )}

            {step === "result" && result && (
              <ResultView prediction={result} isMaximized={isMaximized} onClose={closeModal} />
            )}
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card h-48 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : predictions.length === 0 ? (
          <motion.div variants={fadeIn} className="glass-panel text-center py-20 border-2 border-dashed border-muted/50">
            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Sprout className="w-10 h-10 text-primary" />
            </div>
            <p className="text-xl font-bold text-foreground">No predictions yet</p>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">Start by creating your first AI yield prediction for your fields.</p>
            <Button className="mt-8 gradient-hero text-primary-foreground h-11 px-8 rounded-full" onClick={() => setDialogOpen(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Get Started
            </Button>
          </motion.div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 overflow-visible">
            <AnimatePresence mode="popLayout">
              {predictions.map((p, i) => (
                <PredictionCard
                  key={p.id}
                  prediction={p}
                  index={i}
                  onDelete={() => deleteMutation.mutate(p.id)}
                  onCompare={() => toggleCompare(p.id)}
                  onView={() => { setResult(p as any); setStep("result"); setDialogOpen(true); }}
                  compareSelected={compareIds.includes(p.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </>
  );
}

function parseInputParams(inputParams: string | null | undefined): Record<string, unknown> {
  if (!inputParams) return {};
  try {
    return JSON.parse(inputParams) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function parseSuggestions(suggestions: string | null | undefined): string[] {
  if (!suggestions) return [];
  try {
    const v = JSON.parse(suggestions);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

function CompareShowdown({
  left,
  right,
  onClear,
  toYieldNum,
}: {
  left: Prediction;
  right: Prediction;
  onClear: () => void;
  toYieldNum: (v: number | string) => number;
}) {
  const y1 = toYieldNum(left.predictedYield);
  const y2 = toYieldNum(right.predictedYield);
  const maxY = Math.max(y1, y2);
  const delta = Math.abs(y2 - y1);
  const winner = y2 >= y1 ? "right" : "left";
  const pctDiff = Math.min(y1, y2) > 0 ? Math.round((delta / Math.min(y1, y2)) * 100) : 0;

  const leftInput = parseInputParams(left.inputParams);
  const rightInput = parseInputParams(right.inputParams);
  const leftSuggestions = parseSuggestions(left.suggestions);
  const rightSuggestions = parseSuggestions(right.suggestions);

  const leftDate = left.createdAt ? new Date(left.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";
  const rightDate = right.createdAt ? new Date(right.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="compare-showdown-outer relative overflow-hidden rounded-2xl p-[1px]"
    >
      <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full bg-slate-400/15 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full bg-emerald-500/15 blur-[60px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-sky-500/10 blur-[100px] pointer-events-none" />

      <div className="relative rounded-2xl bg-background/80 dark:bg-background/90 backdrop-blur-xl p-4 md:p-6 border border-white/10 dark:border-white/5">
        <div className="flex items-center justify-between mb-5">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-500/25 to-sky-500/20 border border-slate-400/30">
              <Sparkles className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <span className="font-bold uppercase tracking-widest text-xs text-slate-600 dark:text-slate-400">Head-to-head</span>
              <p className="text-sm font-semibold text-foreground mt-0.5">Compare predictions</p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 flex-wrap justify-end"
          >
            {delta > 0 && (
              <Badge className="bg-gradient-to-r from-emerald-500/25 to-emerald-600/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40 gap-1.5 px-3 py-1 shadow-lg shadow-emerald-500/10">
                <TrendingUp className="w-4 h-4" />
                +{delta.toLocaleString()} kg/ha <span className="opacity-90">({pctDiff}%)</span>
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 md:gap-8 items-stretch">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
            className={cn(
              "rounded-2xl border p-4 md:p-5 transition-all duration-300 flex flex-col backdrop-blur-sm",
              winner === "left"
                ? "compare-winner-card border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 to-emerald-600/5"
                : "border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-border"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{CROP_SYMBOLS[left.cropType || "Other"]} {left.cropType}</p>
              {winner === "left" && (
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400 }} className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Crown className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">Top</span>
                </motion.div>
              )}
            </div>
            <p className="text-3xl md:text-4xl tabular-nums mt-1">
              <span className="compare-yield-number">{y1.toLocaleString()}</span>
              <span className="text-sm font-normal text-muted-foreground ml-1">{left.unit}</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="text-[10px] font-medium">{left.riskLevel ?? "—"} risk</Badge>
              <span className="text-[10px] text-muted-foreground font-medium">{Math.round((left.confidenceScore ?? 0) * 100)}% conf.</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">📅 {leftDate} · {left.status}</p>
            {left.notes && <p className="text-[10px] text-muted-foreground mt-0.5 truncate" title={left.notes}>Note: {left.notes}</p>}
            <div className="mt-3 pt-3 border-t border-border/50 space-y-0.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Conditions</p>
              {(leftInput.soilType || leftInput.irrigationType || leftInput.fertilizerUsed != null) && (
                <ul className="text-[10px] text-muted-foreground space-y-0.5">
                  {leftInput.soilType && <li>Soil: {String(leftInput.soilType)}</li>}
                  {leftInput.irrigationType && <li>Irrigation: {String(leftInput.irrigationType)}</li>}
                  {leftInput.fertilizerUsed != null && <li>Fertilizer: {leftInput.fertilizerUsed ? "Yes" : "No"}</li>}
                  {leftInput.temperature != null && <li>Temp: {String(leftInput.temperature)}°C</li>}
                  {leftInput.rainfall != null && <li>Rainfall: {String(leftInput.rainfall)} mm</li>}
                </ul>
              )}
              {!leftInput.soilType && !leftInput.irrigationType && leftInput.fertilizerUsed == null && <span className="text-[10px] text-muted-foreground">—</span>}
            </div>
            {leftSuggestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Suggestions</p>
                <ul className="text-[10px] text-muted-foreground list-disc pl-3 mt-0.5 space-y-0.5">
                  {leftSuggestions.slice(0, 2).map((s, i) => <li key={i}>{s.length > 60 ? s.slice(0, 60) + "…" : s}</li>)}
                </ul>
              </div>
            )}
            {winner === "left" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-auto pt-3 inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <Zap className="w-4 h-4" /> Higher yield
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
            className="flex flex-col justify-center items-center px-2 md:px-5"
          >
            <div className="compare-vs-badge flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-slate-500/35 to-sky-500/25 border-2 border-slate-400/40 shadow-xl shadow-slate-500/15">
              <span className="text-xl md:text-2xl font-black bg-gradient-to-b from-slate-100 to-slate-600 dark:from-slate-200 dark:to-slate-500 bg-clip-text text-transparent drop-shadow-sm">VS</span>
            </div>
            <div className="flex gap-1.5 mt-4">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-2.5 h-14 md:h-16 rounded-full bg-gradient-to-t from-slate-500/80 to-slate-400/60 flex flex-col justify-end overflow-hidden shadow-inner"
              >
                <motion.div className="w-full bg-slate-500 rounded-t" initial={{ height: "0%" }} animate={{ height: `${maxY ? (y1 / maxY) * 100 : 50}%` }} transition={{ delay: 0.4, duration: 0.6 }} />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.3, ease: "easeInOut" }}
                className="w-2.5 h-14 md:h-16 rounded-full bg-gradient-to-t from-sky-500/80 to-sky-400/60 flex flex-col justify-end overflow-hidden shadow-inner"
              >
                <motion.div className="w-full bg-sky-500 rounded-t" initial={{ height: "0%" }} animate={{ height: `${maxY ? (y2 / maxY) * 100 : 50}%` }} transition={{ delay: 0.5, duration: 0.6 }} />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
            className={cn(
              "rounded-2xl border p-4 md:p-5 transition-all duration-300 flex flex-col backdrop-blur-sm",
              winner === "right"
                ? "compare-winner-card border-emerald-500/50 bg-gradient-to-br from-emerald-500/15 to-emerald-600/5"
                : "border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-border"
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{CROP_SYMBOLS[right.cropType || "Other"]} {right.cropType}</p>
              {winner === "right" && (
                <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 400 }} className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                  <Crown className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">Top</span>
                </motion.div>
              )}
            </div>
            <p className="text-3xl md:text-4xl tabular-nums mt-1">
              <span className="compare-yield-number">{y2.toLocaleString()}</span>
              <span className="text-sm font-normal text-muted-foreground ml-1">{right.unit}</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary" className="text-[10px] font-medium">{right.riskLevel ?? "—"} risk</Badge>
              <span className="text-[10px] text-muted-foreground font-medium">{Math.round((right.confidenceScore ?? 0) * 100)}% conf.</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">📅 {rightDate} · {right.status}</p>
            {right.notes && <p className="text-[10px] text-muted-foreground mt-0.5 truncate" title={right.notes}>Note: {right.notes}</p>}
            <div className="mt-3 pt-3 border-t border-border/50 space-y-0.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Conditions</p>
              {(rightInput.soilType || rightInput.irrigationType || rightInput.fertilizerUsed != null) && (
                <ul className="text-[10px] text-muted-foreground space-y-0.5">
                  {rightInput.soilType && <li>Soil: {String(rightInput.soilType)}</li>}
                  {rightInput.irrigationType && <li>Irrigation: {String(rightInput.irrigationType)}</li>}
                  {rightInput.fertilizerUsed != null && <li>Fertilizer: {rightInput.fertilizerUsed ? "Yes" : "No"}</li>}
                  {rightInput.temperature != null && <li>Temp: {String(rightInput.temperature)}°C</li>}
                  {rightInput.rainfall != null && <li>Rainfall: {String(rightInput.rainfall)} mm</li>}
                </ul>
              )}
              {!rightInput.soilType && !rightInput.irrigationType && rightInput.fertilizerUsed == null && <span className="text-[10px] text-muted-foreground">—</span>}
            </div>
            {rightSuggestions.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase">Suggestions</p>
                <ul className="text-[10px] text-muted-foreground list-disc pl-3 mt-0.5 space-y-0.5">
                  {rightSuggestions.slice(0, 2).map((s, i) => <li key={i}>{s.length > 60 ? s.slice(0, 60) + "…" : s}</li>)}
                </ul>
              </div>
            )}
            {winner === "right" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-auto pt-3 inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                <Zap className="w-4 h-4" /> Higher yield
              </motion.div>
            )}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex gap-0.5 h-3 rounded-full overflow-hidden bg-muted/80 border border-border/50 shadow-inner"
        >
          <motion.div
            className="h-full rounded-l-full bg-gradient-to-r from-slate-500 to-slate-400 shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${maxY ? (y1 / (y1 + y2)) * 100 : 50}%` }}
            transition={{ delay: 0.6, duration: 0.5 }}
          />
          <motion.div
            className="h-full rounded-r-full bg-gradient-to-r from-sky-500 to-sky-400 shadow-sm"
            initial={{ width: 0 }}
            animate={{ width: `${maxY ? (y2 / (y1 + y2)) * 100 : 50}%` }}
            transition={{ delay: 0.6, duration: 0.5 }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-5 pt-5 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="compare-summary-tile rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold text-foreground text-sm">Summary</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>Yield gap: <span className="text-foreground font-medium">{delta.toLocaleString()} kg/ha</span> ({pctDiff}%)</li>
              <li>Confidence: {Math.round((left.confidenceScore ?? 0) * 100)}% vs {Math.round((right.confidenceScore ?? 0) * 100)}%</li>
              <li>Risk: {left.riskLevel ?? "—"} vs {right.riskLevel ?? "—"}</li>
              {left.field?.name || right.field?.name ? (
                <li>Fields: {left.field?.name ?? "—"} vs {right.field?.name ?? "—"}</li>
              ) : null}
            </ul>
          </div>
          <div className="compare-summary-tile rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="font-semibold text-foreground text-sm">Key differences</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              {leftInput.soilType !== rightInput.soilType && (leftInput.soilType || rightInput.soilType) && (
                <li>Soil: {String(leftInput.soilType || "—")} vs {String(rightInput.soilType || "—")}</li>
              )}
              {leftInput.irrigationType !== rightInput.irrigationType && (leftInput.irrigationType || rightInput.irrigationType) && (
                <li>Irrigation: {String(leftInput.irrigationType || "—")} vs {String(rightInput.irrigationType || "—")}</li>
              )}
              {Boolean(leftInput.fertilizerUsed) !== Boolean(rightInput.fertilizerUsed) && (
                <li>Fertilizer: {leftInput.fertilizerUsed ? "Yes" : "No"} vs {rightInput.fertilizerUsed ? "Yes" : "No"}</li>
              )}
              {!leftInput.soilType && !rightInput.soilType && leftInput.irrigationType === rightInput.irrigationType && leftInput.fertilizerUsed === rightInput.fertilizerUsed && (
                <li>Same crop — different inputs or timing</li>
              )}
            </ul>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function toYieldNum(v: number | string): number {
  return typeof v === "number" ? v : parseFloat(String(v)) || 0;
}

function ResultView({
  prediction,
  onClose,
  isMaximized = false,
}: {
  prediction: Prediction & { suggestedImprovements?: string[] };
  onClose: () => void;
  isMaximized?: boolean;
}) {
  const yieldVal = toYieldNum(prediction.predictedYield);
  const score = prediction.confidenceScore ?? 0.85;

  const suggestions = prediction.suggestedImprovements ?? parseSuggestions(prediction.suggestions);

  const yieldTrendData = [
    { name: "Base", value: Math.round(yieldVal * 0.7) },
    { name: "Optimal", value: Math.round(yieldVal * 1.1) },
    { name: "Current", value: yieldVal },
  ];

  const nutrientData = [
    { name: "Nitrogen (N)", value: 72, color: "hsl(var(--primary))" },
    { name: "Phosphorus (P)", value: 58, color: "hsl(var(--sun-gold))" },
    { name: "Potassium (K)", value: 45, color: "hsl(var(--destructive))" },
  ];

  const environmentalTrend = [
    { day: "Day 10", temp: 22, rain: 40 },
    { day: "Day 30", temp: 25, rain: 35 },
    { day: "Day 50", temp: 28, rain: 60 },
    { day: "Day 70", temp: 30, rain: 45 },
    { day: "Day 90", temp: 27, rain: 70 },
    { day: "Day 110", temp: 24, rain: 50 },
  ];

  return (
    <motion.div variants={staggerContainer} initial="initial" animate="animate" className={cn("space-y-6", isMaximized && "max-w-6xl mx-auto")}>
      <div className={cn("glass-panel text-center relative overflow-hidden transition-all duration-500", isMaximized ? "p-12 mb-8" : "p-8")}>
        <div className="absolute top-0 right-0 p-4">
          <Badge className="bg-primary/20 text-primary border-0">{prediction.riskLevel ?? "Low"} Risk</Badge>
        </div>
        
        <div className="mb-6">
          <ConfidenceGauge score={score} size={isMaximized ? "lg" : "md"} />
          <p className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-widest">AI Confidence Score</p>
        </div>

        <p className="text-sm font-bold text-primary mb-1 uppercase tracking-tight">
          {CROP_SYMBOLS[prediction.cropType || "Other"]} Predicted Yield
        </p>
        <p className={cn("font-black tabular-nums text-foreground transition-all duration-500", isMaximized ? "text-7xl" : "text-5xl")}>
          {yieldVal.toLocaleString()} 
          <span className="text-xl font-normal text-muted-foreground ml-2">{prediction.unit}</span>
        </p>
        
        <p className="text-[10px] text-muted-foreground mt-4 font-mono">
          GENERATED ON {new Date(prediction.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className={cn("grid gap-4", isMaximized ? "md:grid-cols-3" : "md:grid-cols-2")}>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold">AI Recommendations</h4>
          </div>
          <ul className="space-y-3">
            {suggestions.length > 0 ? suggestions.slice(0, isMaximized ? 6 : 3).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                {s}
              </li>
            )) : (
              <li className="text-xs text-muted-foreground">Conditions are optimal. Continue current management practices.</li>
            )}
          </ul>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold">Yield Potential Graph</h4>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yieldTrendData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={60} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 10, backdropFilter: "blur(8px)" }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={20}>
                  {yieldTrendData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.name === "Current" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground)/0.2)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {isMaximized && (
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Droplets className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold">Soil Nutrient Profile</h4>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={nutrientData}>
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 10, backdropFilter: "blur(8px)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={30}>
                    {nutrientData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between mt-2 text-[9px] font-bold text-muted-foreground">
              <span>N: 72%</span>
              <span>P: 58%</span>
              <span>K: 45%</span>
            </div>
          </div>
        )}
      </div>

      <div className={cn("grid gap-4", isMaximized ? "md:grid-cols-3" : "md:grid-cols-2")}>
        <div className={cn("glass-card p-6 flex flex-col items-center", isMaximized && "md:col-span-1")}>
          <div className="flex items-center gap-2 mb-6 w-full">
            <BarChart3 className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold">Factor Impact Analysis</h4>
          </div>
          <div className={cn("w-full transition-all duration-500", isMaximized ? "h-80 max-w-[400px]" : "h-64 max-w-[280px]")}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { subject: 'Rainfall', A: 110, fullMark: 150 },
                { subject: 'Temp', A: 98, fullMark: 150 },
                { subject: 'Soil Health', A: 86, fullMark: 150 },
                { subject: 'Fertilizer', A: 99, fullMark: 150 },
                { subject: 'Irrigation', A: 85, fullMark: 150 },
                { subject: 'Variety', A: 65, fullMark: 150 },
              ]}>
                <PolarGrid stroke="hsl(var(--muted-foreground)/0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 700 }} />
                <Radar name="Yield Boost" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {isMaximized ? (
          <div className="glass-card p-6 md:col-span-2">
            <div className="flex items-center gap-2 mb-6 w-full">
              <Waves className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold">Environmental Correlation (Temp & Rain)</h4>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={environmentalTrend}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--sun-gold))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--sun-gold))" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 10, backdropFilter: "blur(8px)" }}
                  />
                  <Area type="monotone" dataKey="temp" stroke="hsl(var(--sun-gold))" fillOpacity={1} fill="url(#colorTemp)" />
                  <Area type="monotone" dataKey="rain" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorRain)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-[10px] font-bold">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sun-gold" /> Temperature</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary" /> Rainfall</div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Dna className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold">Strategic Optimization</h4>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Optimized Variety</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The AI suggests switching to <span className="text-foreground font-bold">Symphony Plus</span> seeds for next cycle to potentially gain <span className="text-emerald-500 font-bold">+8% yield</span>.
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Risk Mitigation</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  High humidity peak expected in Week 12. Pre-emptive fungicidal treatment recommended on Day 75.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isMaximized && (
        <div className="grid md:grid-cols-2 gap-4">
           <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Dna className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold">Strategic Optimization</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Optimized Variety</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The AI suggests switching to <span className="text-foreground font-bold">Symphony Plus</span> seeds for next cycle to potentially gain <span className="text-emerald-500 font-bold">+8% yield</span>.
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Risk Mitigation</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  High humidity peak expected in Week 12. Pre-emptive fungicidal treatment recommended on Day 75.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-sun-gold/5 border border-sun-gold/10">
                <div className="flex items-center gap-2 mb-1">
                  <Thermometer className="w-3.5 h-3.5 text-sun-gold" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Heat Resilience</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Apply mulch layer to retain soil moisture during the upcoming heatwave in Week 14.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Irrigation Shift</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Shift irrigation to early morning (4 AM) to reduce evaporative loss by <span className="text-blue-500 font-bold">15%</span>.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <Badge className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-bold">Field Statistics & Records</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground">Field Area</span>
                <span className="text-xs font-bold text-foreground">2.45 Hectares</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground">Soil Conductivity</span>
                <span className="text-xs font-bold text-foreground">1.2 mS/cm</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground">Previous Year Yield</span>
                <span className="text-xs font-bold text-foreground">5,120 kg/ha</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-xs text-muted-foreground">Projected Harvest Date</span>
                <span className="text-xs font-bold text-foreground">Oct 12, 2026</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-muted-foreground">Data Fidelity</span>
                <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/20 bg-emerald-500/5">High Confidence</Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-4 h-4 text-primary" />
          <h4 className="text-sm font-bold">Projected Milestone Timeline</h4>
        </div>
        <div className="flex items-start gap-4 relative">
          <div className="absolute top-[9px] left-8 right-8 h-[2px] bg-primary/40 -z-10" />
          {[
            { phase: "Booting", day: "Day 65", status: "Critical" },
            { phase: "Flowering", day: "Day 90", status: "Optimal" },
            { phase: "Grain Filling", day: "Day 115", status: "Optimal" },
            { phase: "Maturity", day: "Day 130", status: "Projected" },
            ...(isMaximized ? [{ phase: "Harvest", day: "Day 145", status: "Target" }] : []),
          ].map((m, i) => (
            <div key={i} className="flex-1 relative pb-6">
              <div className="w-5 h-5 rounded-full bg-background border-4 border-primary shadow-sm mb-3 mx-auto" />
              <p className="text-[10px] font-black text-foreground uppercase tracking-tighter text-center">{m.phase}</p>
              <p className="text-[9px] text-muted-foreground text-center mt-1">{m.day}</p>
              <div className="mt-2 flex justify-center">
                <Badge variant="outline" className="text-[8px] h-4 uppercase font-bold px-1.5 opacity-60">
                  {m.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full h-12 rounded-xl gradient-hero text-primary-foreground font-bold" onClick={onClose}>
        Continue to Dashboard
      </Button>
    </motion.div>
  );
}

function PredictionCard({
  prediction,
  index,
  onDelete,
  onCompare,
  onView,
  compareSelected,
}: {
  prediction: Prediction;
  index: number;
  onDelete: () => void;
  onCompare: () => void;
  onView: () => void;
  compareSelected: boolean;
}) {
  const yieldVal = toYieldNum(prediction.predictedYield);
  const score = prediction.confidenceScore ?? 0.85;
  const riskColor = (prediction.riskLevel === "High" ? "text-destructive border-destructive/20 bg-destructive/5" : (prediction.riskLevel === "Medium" ? "text-sun-gold border-sun-gold/20 bg-sun-gold/5" : "text-primary border-primary/20 bg-primary/5"));

  const chartData = [
    { name: "Prev", value: Math.round(yieldVal * 0.9) },
    { name: "Est.", value: yieldVal },
  ];

  const suggestions = parseSuggestions(prediction.suggestions);

  return (
    <Collapsible>
      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: compareSelected ? 1.02 : 1,
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: index * 0.03, type: "spring", stiffness: 400, damping: 30 }}
        className={cn(
          "group glass-card rounded-2xl transition-all duration-300 relative overflow-visible",
          compareSelected && "ring-2 ring-primary bg-primary/5 dark:bg-primary/10 shadow-lg shadow-primary/10"
        )}
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <CollapsibleTrigger asChild>
              <button type="button" className="group flex-1 text-left min-w-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shadow-inner text-foreground">
                    {CROP_SYMBOLS[prediction.cropType || "Other"]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-foreground uppercase tracking-tight truncate leading-tight">
                      {prediction.cropType}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                      {new Date(prediction.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Estimated Yield</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-foreground tabular-nums tracking-tighter">
                        {yieldVal.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold uppercase">{prediction.unit}</span>
                    </div>
                  </div>

                  <div className="flex justify-end items-center pr-10">
                    <div className="relative w-12 h-12 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" className="stroke-muted/30" strokeWidth="3" />
                        <motion.circle
                          cx="18" cy="18" r="16" fill="none"
                          className={Math.round(score * 100) > 80 ? "stroke-primary" : "stroke-sun-gold"}
                          strokeWidth="3"
                          strokeLinecap="round"
                          initial={{ strokeDasharray: "0 100" }}
                          animate={{ strokeDasharray: `${Math.round(score * 100)} 100` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </svg>
                      <span className="absolute text-[10px] font-black text-foreground">{Math.round(score * 100)}%</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Badge variant="outline" className="h-6 rounded-lg uppercase text-[9px] font-black tracking-widest bg-muted/30 border-muted/50 text-muted-foreground">
                    Completed
                  </Badge>
                  {prediction.riskLevel && (
                    <Badge variant="outline" className={cn("h-6 rounded-lg uppercase text-[9px] font-black tracking-widest border-transparent", riskColor)}>
                      {prediction.riskLevel} Risk
                    </Badge>
                  )}
                </div>
                
                <div className="mt-4 flex items-center justify-center">
                  <ChevronDown className="w-4 h-4 text-muted-foreground/50 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </div>
              </button>
            </CollapsibleTrigger>

            <div className="absolute top-4 right-4 flex flex-col gap-1.5 z-20">
              <Button
                variant="ghost" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); onCompare(); }}
                className={cn(
                  "w-8 h-8 rounded-lg transition-all",
                  compareSelected 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" 
                    : "bg-muted/10 hover:bg-muted/30 text-muted-foreground/40 hover:text-primary"
                )}
                title={compareSelected ? "Remove comparison" : "Add to comparison"}
              >
                <GitCompare className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); onView(); }}
                className="w-8 h-8 rounded-lg bg-muted/10 hover:bg-muted/30 text-muted-foreground/40 hover:text-primary transition-all"
                title="View Result Modal"
              >
                <Info className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                className="w-8 h-8 rounded-lg text-muted-foreground/10 hover:bg-destructive/10 hover:text-destructive animate-pulse-slow transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <CollapsibleContent>
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="pt-5 mt-5 border-t border-border/50 space-y-5"
            >
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Yield Potential</p>
                </div>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted)/0.3)" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }} 
                        contentStyle={{ 
                          backgroundColor: "hsl(var(--card))", 
                          borderRadius: 8, 
                          border: "1px solid hsl(var(--border))", 
                          fontSize: 10,
                          fontWeight: 600,
                          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">AI Insights</p>
                  </div>
                  <ul className="space-y-2">
                    {suggestions.slice(0, 2).map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground leading-relaxed italic">
                        <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="pt-2">
                <p className="text-[10px] text-muted-foreground font-medium text-center italic">
                  Field: <span className="text-foreground not-italic font-bold">{prediction.field?.name || "Global Model"}</span>
                </p>
              </div>
            </motion.div>
          </CollapsibleContent>
        </div>
      </motion.div>
    </Collapsible>
  );
}
