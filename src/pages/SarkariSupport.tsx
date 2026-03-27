import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { Landmark, Sprout, MapPin, Loader2, ArrowRight, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const CROP_SYMBOLS: Record<string, string> = {
  Rice: "🌾",
  Wheat: "🌾",
  Maize: "🌽",
  Cotton: "☁️",
  Sugarcane: "🎋",
  Other: "🌱",
};

const STATE_SYMBOLS: Record<string, string> = {
  "Andhra Pradesh": "🏛️",
  "Bihar": "🕉️",
  "Gujarat": "🦁",
  "Haryana": "🚜",
  "Karnataka": "🐘",
  "Madhya Pradesh": "🐯",
  "Maharashtra": "🚩",
  "Punjab": "🌾",
  "Rajasthan": "🐫",
  "Tamil Nadu": "🛕",
  "Telangana": "🏗️",
  "Uttar Pradesh": "🛕",
  "West Bengal": "🐅"
};

// Mock fallbacks in case AI fails
const FALLBACK_SCHEMES = [
  {
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    description: "Income support to all landholding farmer families.",
    benefitAmount: "₹6,000 / year",
    eligibility: "All landholding farmers subject to specific exclusion criteria.",
    link: "https://pmkisan.gov.in/"
  },
  {
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    description: "Crop insurance scheme providing financial support in case of crop failure due to natural calamities.",
    benefitAmount: "Varies based on crop value",
    eligibility: "Farmers growing notified crops in notified areas.",
    link: "https://pmfby.gov.in/"
  },
  {
    name: "KCC (Kisan Credit Card)",
    description: "Provides farmers with timely access to credit for agricultural needs.",
    benefitAmount: "Credit limit based on land & crop",
    eligibility: "All farmers, individuals, and joint borrowers.",
    link: "https://sbi.co.in/web/agri-rural/agriculture-banking/crop-loan/kisan-credit-card"
  }
];

interface Scheme {
  name: string;
  description: string;
  benefitAmount: string;
  eligibility: string;
  link: string;
}

export default function SarkariSupport() {
  const [landSize, setLandSize] = useState("");
  const [cropType, setCropType] = useState("");
  const [state, setState] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[] | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!landSize || !cropType || !state) {
      toast.error("Please fill in all details to find accurate schemes.");
      return;
    }

    setIsSearching(true);
    setSchemes(null);

    try {
      const prompt = `Act as an Indian Government Agricultural Scheme expert. 
A farmer is looking for subsidies, grants, and schemes.
Land Size: ${landSize} acres
Crop Type: ${cropType}
State/Region: ${state}

Analyze these details and provide a JSON array of the top 3-4 exact Indian government agricultural schemes they are highly likely eligible for (e.g., PM-Kisan, PMFBY, KCC, and State-specific schemes perfectly matching their input).

You MUST reply with ONLY a raw JSON array. DO NOT include markdown formatting like \`\`\`json. DO NOT add any other text.
Format:
[
  {
    "name": "Scheme Name",
    "description": "Short 1-2 sentence explanation",
    "benefitAmount": "e.g., ₹6000/year or ₹2000/acre",
    "eligibility": "Briefly why this farmer qualifies",
    "link": "MANDATORY: Actual full URL (https://...). If the portal is unknown, use EXACTLY 'https://agricoop.nic.in/'"
  }
]`;

      const res = await api.chat.send({ message: prompt });
      let replyText = res.reply.trim();
      
      // Clean up potential markdown formatting from the AI response
      if (replyText.startsWith("```json")) {
        replyText = replyText.replace(/```json/g, "").replace(/```/g, "").trim();
      } else if (replyText.startsWith("```")) {
        replyText = replyText.replace(/```/g, "").trim();
      }

      const parsedSchemes = JSON.parse(replyText);
      
      if (Array.isArray(parsedSchemes) && parsedSchemes.length > 0) {
        setSchemes(parsedSchemes);
        toast.success("Found highly relevant schemes for you!");
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to fetch schemes natively, falling back to static list", error);
      toast.error("AI service is busy. Showing general eligible schemes.");
      // Fallback
      setSchemes(FALLBACK_SCHEMES);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <motion.div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary w-fit text-sm font-semibold">
            <Landmark className="w-4 h-4" />
            AI Scheme Discoverer
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Claim Your <span className="text-primary">Sarkari Benefits</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Billions in government agricultural subsidies go unclaimed every year. Enter your farm details below, and our AI will instantly match you to the exact Indian Government schemes you are eligible for.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Form Column */}
          <div className="lg:col-span-4">
            <Card className="border shadow-lg shadow-black/5">
              <CardHeader className="bg-muted/30 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserIcon /> Farm Details
                </CardTitle>
                <CardDescription>We use this to find matching subsidies</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSearch} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="landSize" className="flex items-center gap-2 font-semibold">
                      <MapPin className="w-4 h-4 text-primary" />
                      Land Size (Acres)
                    </Label>
                    <Input
                      id="landSize"
                      type="number"
                      placeholder="e.g. 2.5"
                      value={landSize}
                      onChange={(e) => setLandSize(e.target.value)}
                      className="h-12 bg-background"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cropType" className="flex items-center gap-2 font-semibold">
                      <Sprout className="w-4 h-4 text-primary" />
                      Primary Crop
                    </Label>
                    <Select value={cropType} onValueChange={setCropType} required>
                      <SelectTrigger className="h-12 bg-background">
                        <SelectValue placeholder="Select a Crop" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(CROP_SYMBOLS).map(([name, icon]) => (
                          <SelectItem key={name} value={name}>
                            <span className="flex items-center gap-2">
                              <span>{icon}</span>
                              {name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state" className="flex items-center gap-2 font-semibold">
                      <Landmark className="w-4 h-4 text-primary" />
                      Your State
                    </Label>
                    <Select value={state} onValueChange={setState} required>
                      <SelectTrigger className="h-12 bg-background">
                        <SelectValue placeholder="Select a State" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATE_SYMBOLS).map(([name, icon]) => (
                          <SelectItem key={name} value={name}>
                            <span className="flex items-center gap-2">
                              <span>{icon}</span>
                              {name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-bold shadow-lg shadow-primary/25 group"
                    disabled={isSearching}
                  >
                    {isSearching ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Scanning Gov Portals...
                      </>
                    ) : (
                      <>
                        Discover My Schemes
                        <ArrowRight className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              {!schemes && !isSearching && (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted/10"
                >
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Landmark className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Ready to find free money?</h3>
                  <p className="max-w-md">Enter your information on the left, and our AI will cross-reference hundreds of state and central schemes instantly.</p>
                </motion.div>
              )}

              {isSearching && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center"
                >
                  <div className="relative mb-8">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                    <div className="relative bg-background p-4 rounded-full border border-primary/20 shadow-xl">
                      <Landmark className="w-12 h-12 text-primary animate-bounce" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Analyzing Eligibility Rules...</h3>
                  <p className="text-muted-foreground animate-pulse">Matching land size {landSize} acres and {cropType} crop data with {state} government databases...</p>
                </motion.div>
              )}

              {schemes && !isSearching && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                      Matches Found
                    </h3>
                    <span className="text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1 rounded-full">
                      {schemes.length} Schemes Available
                    </span>
                  </div>

                  {schemes.map((scheme, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden border group hover:border-primary/50 transition-colors">
                        <div className="absolute inset-y-0 left-0 w-1 bg-primary transform origin-left transition-transform scale-x-0 group-hover:scale-x-100" />
                        <CardHeader className="pb-3 flex flex-row items-start justify-between">
                          <div>
                            <CardTitle className="text-lg text-primary">{scheme.name}</CardTitle>
                            <CardDescription className="mt-1 text-sm text-foreground/80 font-medium">
                              {scheme.description}
                            </CardDescription>
                          </div>
                          <div className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap ml-4">
                            {scheme.benefitAmount}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="bg-muted/50 p-3 rounded-lg flex items-start gap-3 mb-4">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Why you qualify</p>
                              <p className="text-sm">{scheme.eligibility}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
                            <Button asChild variant="outline" className="flex-1 sm:flex-none">
                              <a 
                                href={(() => {
                                  let url = (scheme.link || '').trim();
                                  if (
                                    !url || 
                                    url.includes('placeholder') || 
                                    url.includes('[URL]') || 
                                    url.includes('(') || 
                                    url.includes(' ') ||
                                    (!url.includes('.') && !url.startsWith('http'))
                                  ) {
                                    return 'https://agricoop.nic.in/';
                                  }
                                  if (url.startsWith('http://') || url.startsWith('https://')) return url;
                                  if (url.startsWith('//')) return `https:${url}`;
                                  return `https://${url}`;
                                })()} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                Official Portal
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </a>
                            </Button>

                            <Button asChild variant="secondary" className="flex-1 sm:flex-none">
                              <a 
                                href={`https://www.google.com/search?q=${encodeURIComponent(scheme.name + " " + state + " official website agricultural scheme")}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                Search on Google
                                <ExternalLink className="w-4 h-4 ml-2" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
