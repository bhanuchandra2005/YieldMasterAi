import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn, staggerContainer } from "@/lib/animations";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Store, MapPin, ArrowUpRight, ArrowDownRight, 
  Wallet, Calculator, LineChart, Search, Sparkles, RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const MandiConnect = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<string>("Rice");
  const [yieldAmount, setYieldAmount] = useState<number>(30); // quintals
  const [isGeneratingTips, setIsGeneratingTips] = useState(false);
  const [sellingTips, setSellingTips] = useState<string | null>(null);

  const { data: marketData, isLoading: marketLoading, refetch } = useQuery({
    queryKey: ["dashboard", "market", user?.location],
    queryFn: () => api.market.getPrices(user?.location || "Regional APMC"),
  });

  const filteredCrops = marketData?.prices?.filter(p => 
    p.crop.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedCropPrice = marketData?.prices?.find(p => p.crop === selectedCrop)?.pricePerQuintal || 0;
  const projectedIncome = selectedCropPrice * yieldAmount;

  const handleGetTips = async () => {
    if (yieldAmount <= 0) return toast.error("Please enter a valid yield amount");
    try {
      setIsGeneratingTips(true);
      setSellingTips(null);
      
      const prompt = `Act as an expert AI trading bot for Indian farmers. A farmer intends to sell ${yieldAmount} quintals of ${selectedCrop} right now. The current local Mandi rate is ₹${selectedCropPrice.toLocaleString()}/qtl. 
Do not give me theory. Give me a hyper-concise 3-line response formatted exactly like this (use ** for bold):
**1. Trend Predictor:** (Tell me if the price will go up or down next week, and guess a future target price)
**2. Action:** (A precise 1-sentence recommendation: Sell Now, Hold 1 Week, etc.)
**3. Market Intel:** (A 1-sentence tip on who is buying or how to sell it better)`;

      const res = await api.chat.send({ message: prompt });
      setSellingTips(res.reply);
      toast.success("AI Strategy generated!");
    } catch (error: any) {
       toast.error(error.message || "Failed to generate market strategy.");
    } finally {
       setIsGeneratingTips(false);
    }
  };

  return (
    <>
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-8"
      >
        {/* Header Section */}
        <motion.div variants={fadeIn} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Mandi-Connect
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-primary" />
              </div>
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" /> Live Daily Prices for {marketData?.location || "Your Area"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search crops..." 
                className="pl-9 bg-background/50 border-border/50 focus-visible:ring-primary/20 transition-all rounded-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="rounded-full shrink-0 h-10 w-10 border-border/50" onClick={() => refetch()}>
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
           {/* Market Prices Grid */}
           <motion.div variants={fadeIn} className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-bold font-display flex items-center gap-2">
                 <LineChart className="w-5 h-5 text-emerald-500" />
                 Today's APMC Rates
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {marketLoading ? (
                  [1, 2, 3, 4].map((i) => <div key={i} className="glass-card h-28 animate-pulse bg-muted/20" />)
                ) : filteredCrops?.length === 0 ? (
                  <div className="col-span-2 glass-card p-8 text-center text-muted-foreground">No crops found matching your search.</div>
                ) : (
                  filteredCrops?.map((p, i) => (
                    <motion.div 
                      key={p.crop}
                      whileHover={{ y: -2, scale: 1.01 }}
                      className={`glass-card p-5 cursor-pointer border-2 transition-colors ${selectedCrop === p.crop ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-border/50'}`}
                      onClick={() => setSelectedCrop(p.crop)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${p.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'} flex items-center justify-center`}>
                             {p.trend === 'up' ? <ArrowUpRight className="w-5 h-5"/> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">{p.crop}</h3>
                            <p className="text-[10px] text-muted-foreground hover:underline">View Mandi Details</p>
                          </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${p.trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                          {p.trend === 'up' ? '+' : '-'}{p.changePct}%
                        </div>
                      </div>
                      <div className="flex items-end justify-between">
                         <div>
                            <p className="text-2xl font-black tabular-nums tracking-tight">₹{p.pricePerQuintal.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">per Quintal</p>
                         </div>
                         <div className="text-right">
                            <p className="text-sm font-bold tabular-nums text-foreground/80">₹{p.trend === 'up' ? p.pricePerQuintal - 150 : p.pricePerQuintal + 150}</p>
                            <p className="text-[10px] text-muted-foreground">Yesterday</p>
                         </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
           </motion.div>

           {/* Income Predictor Calculator */}
           <motion.div variants={fadeIn} className="relative">
              <div className="sticky top-6">
                 <div className="glass-card p-0 overflow-hidden border-primary/20">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 border-b border-border/50">
                       <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                         <Calculator className="w-5 h-5" />
                         Income Predictor AI
                       </h2>
                       <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                         Select a crop from the dashboard and enter your predicted yield to estimate your gross revenue based on today's live Mandi rates.
                       </p>
                    </div>
                    <div className="p-6 space-y-6">
                       <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Selected Crop</label>
                         <div className="h-10 px-3 bg-secondary/50 rounded-lg flex items-center justify-between border border-border/50">
                            <span className="font-medium">{selectedCrop}</span>
                            <span className="text-sm font-bold text-primary tabular-nums">₹{selectedCropPrice.toLocaleString()}/qtl</span>
                         </div>
                       </div>
                       
                       <div className="space-y-2">
                         <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex justify-between">
                           Estimated Yield
                           <span className="lowercase font-normal">in quintals</span>
                         </label>
                         <Input 
                           type="number"
                           value={yieldAmount}
                           onChange={(e) => setYieldAmount(Number(e.target.value) || 0)}
                           className="font-bold tabular-nums bg-background"
                           min={1}
                         />
                       </div>

                       <div className="pt-4 border-t border-border/50">
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">Projected Revenue</p>
                          <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                               <Wallet className="w-6 h-6" />
                             </div>
                             <div>
                               <h3 className="text-3xl font-black tracking-tight tabular-nums bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                 ₹{projectedIncome.toLocaleString()}
                               </h3>
                             </div>
                          </div>
                       </div>

                       <Button 
                         className="w-full gradient-hero text-primary-foreground shadow-lg font-bold group"
                         onClick={handleGetTips}
                         disabled={isGeneratingTips}
                       >
                         {isGeneratingTips ? (
                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                         ) : (
                           <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                         )}
                         {isGeneratingTips ? "Generating Strategy..." : "Get Selling Tips"}
                       </Button>

                       {sellingTips && (
                         <motion.div 
                           initial={{ opacity: 0, height: 0 }}
                           animate={{ opacity: 1, height: 'auto' }}
                           className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm leading-relaxed"
                         >
                            <h4 className="font-bold text-primary mb-2 flex items-center gap-2">
                              <Sparkles className="w-4 h-4" />
                              Expert Strategy for {selectedCrop}
                            </h4>
                            <div 
                               className="text-foreground/80 leading-relaxed space-y-4 ml-1 mt-4"
                               dangerouslySetInnerHTML={{ __html: sellingTips.replace(/\*\*(.*?)\*\*/g, '<b class="text-foreground">$1</b>').replace(/\n/g, '<br/>') }}
                            />
                         </motion.div>
                       )}
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default MandiConnect;
