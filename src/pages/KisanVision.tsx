import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { Camera, Image as ImageIcon, Loader2, Leaf, ShieldCheck, AlertTriangle, Droplets, FlaskConical, TrendingDown, ArrowRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { toast } from "sonner";

interface Diagnosis {
  cropName: string;
  issueFound: boolean;
  diagnosisTitle: string;
  confidenceScore: number;
  organicRemedy: string;
  chemicalRemedy: string;
  yieldLossImpact: string;
  detailedExplanation: string;
}

export default function KisanVision() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setDiagnosis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const startScan = async () => {
    if (!selectedFile || !imagePreview) return;
    
    setIsScanning(true);
    try {
      // Extract the pure base64 part
      const base64Data = imagePreview.split(',')[1];
      
      const res = await api.chat.vision({
        image: base64Data,
        mimeType: selectedFile.type
      });
      
      setDiagnosis(res.diagnosis);
      toast.success("Crop diagnosis complete!");
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze image");
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setDiagnosis(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <>
      <motion.div variants={staggerContainer} initial="initial" animate="animate" className="max-w-4xl mx-auto space-y-6">
        
        <motion.div variants={fadeIn} className="flex flex-col items-center justify-center text-center space-y-3 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
            <Camera className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Kisan Vision</h1>
          <p className="text-muted-foreground max-w-lg">
            Upload a photo of your crop or leaf to instantly diagnose diseases, get actionable remedies, and estimate yield impact using AI.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column: Upload & Preview */}
          <motion.div variants={fadeIn} className="glass-card p-6 flex flex-col items-center border border-border/50">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageChange}
            />

            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 group"
              >
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground">Tap to take a photo</h3>
                  <p className="text-sm text-muted-foreground mt-1">or select from gallery</p>
                </div>
              </div>
            ) : (
              <div className="w-full relative rounded-2xl overflow-hidden group">
                <img 
                  src={imagePreview} 
                  alt="Crop preview" 
                  className="w-full aspect-[4/3] object-cover"
                />
                
                {/* Scanning Overlay Animation */}
                <AnimatePresence>
                  {isScanning && (
                    <motion.div 
                      initial={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      className="absolute inset-0 bg-primary/10 backdrop-blur-[2px] z-10"
                    >
                      <motion.div 
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-primary shadow-[0_0_15px_rgba(34,197,94,0.8)]"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-primary-foreground drop-shadow-md">
                        <Loader2 className="w-10 h-10 animate-spin text-white mb-2 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                        <span className="font-bold text-lg text-white filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">Analyzing Crop...</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isScanning && !diagnosis && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="bg-background/80 hover:bg-background border-none">
                      Retake
                    </Button>
                    <Button className="gradient-hero text-white border-none shadow-lg" onClick={startScan}>
                      Analyze Now <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {imagePreview && !diagnosis && !isScanning && (
              <Button className="w-full mt-6 gradient-hero text-white py-6 rounded-xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-shadow text-lg font-bold" onClick={startScan}>
                Diagnose Issue <Camera className="w-5 h-5 ml-2" />
              </Button>
            )}

            {diagnosis && (
              <Button variant="ghost" className="w-full mt-4 text-muted-foreground" onClick={reset}>
                <RefreshCcw className="w-4 h-4 mr-2" /> Scan Another Crop
              </Button>
            )}
          </motion.div>

          {/* Right Column: Results */}
          <AnimatePresence mode="popLayout">
            {diagnosis ? (
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="space-y-4"
              >
                {/* Headline Result Card */}
                <div className={`rounded-2xl p-6 border ${diagnosis.issueFound ? 'bg-destructive/5 border-destructive/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge variant="outline" className={`mb-2 font-mono ${diagnosis.issueFound ? 'text-destructive border-destructive/30' : 'text-emerald-600 border-emerald-500/30'}`}>
                        {diagnosis.cropName}
                      </Badge>
                      <h2 className="text-2xl font-bold text-foreground leading-tight">
                        {diagnosis.diagnosisTitle}
                      </h2>
                    </div>
                    {diagnosis.issueFound ? (
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                        <AlertTriangle className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">
                    {diagnosis.detailedExplanation}
                  </p>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Confidence</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${diagnosis.confidenceScore > 0.8 ? 'bg-emerald-500' : 'bg-sun-gold'}`}
                        style={{ width: `${diagnosis.confidenceScore * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold">{Math.round(diagnosis.confidenceScore * 100)}%</span>
                  </div>
                </div>

                {/* Remedies Grid (Only if issue found) */}
                {diagnosis.issueFound && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-card p-4 border-l-4 border-l-emerald-500 flex flex-col h-full bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="w-4 h-4 text-emerald-600" />
                          <h3 className="font-bold text-sm text-foreground">Organic Remedy</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                          {diagnosis.organicRemedy}
                        </p>
                      </div>
                      
                      <div className="glass-card p-4 border-l-4 border-l-sky-500 flex flex-col h-full bg-sky-500/5 hover:bg-sky-500/10 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <FlaskConical className="w-4 h-4 text-sky-600" />
                          <h3 className="font-bold text-sm text-foreground">Chemical Option</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed flex-1">
                          {diagnosis.chemicalRemedy}
                        </p>
                      </div>
                    </div>

                    {/* Yield Impact Warning */}
                    <div className="rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/5 border border-orange-500/20 p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-600 flex items-center justify-center shrink-0">
                        <TrendingDown className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">Estimated Yield Impact</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Potential loss of <span className="font-bold text-orange-600">{diagnosis.yieldLossImpact}</span> if left untreated. Act quickly to protect your harvest.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="h-full border-2 border-dashed border-muted/50 rounded-2xl flex flex-col items-center justify-center text-center p-8 bg-muted/10 min-h-[400px]"
              >
                <Leaf className="w-12 h-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Awaiting Image</h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  Upload a clear photo of the top and bottom of a leaf, or the entire plant for the most accurate diagnosis.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </>
  );
}

