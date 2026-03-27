const TOKEN_KEY = "token";

const getToken = () => localStorage.getItem(TOKEN_KEY);

function getApiBase(): string {
  const env = import.meta.env.VITE_API_URL;
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:4001";
}

/** Call when 401 received so auth state and storage stay in sync */
function onUnauthorized(): void {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new CustomEvent("auth:unauthorized"));
}

export const api = {
  async request<T>(
    path: string,
    options: RequestInit & { params?: Record<string, string> } = {}
  ): Promise<T> {
    const { params, ...init } = options;
    const base = getApiBase();
    const full = path.startsWith("http") ? path : base + path;
    const url = new URL(full);
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const token = getToken();
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string>),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await fetch(url.toString(), { ...init, headers });
    const data = (await res.json().catch(() => ({}))) as { message?: unknown; error?: unknown };
    if (!res.ok) {
      if (res.status === 401) onUnauthorized();
      const raw = data.message ?? data.error;
      const message =
        typeof raw === "string"
          ? raw
          : raw && typeof raw === "object"
          ? JSON.stringify(raw)
          : res.statusText;
      throw new Error(message);
    }
    return data as T;
  },

  auth: {
    signup: (body: { email: string; password: string; name?: string }) =>
      api.request<{ user: User; token: string }>("/api/auth/signup", { method: "POST", body: JSON.stringify(body) }),
    login: (body: { email: string; password: string }) =>
      api.request<{ user: User; token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
    changePassword: (body: { oldPassword: string; newPassword: string }) =>
      api.request<{ message: string }>("/api/auth/change-password", { method: "PUT", body: JSON.stringify(body) }),
  },
  users: {
    me: () => api.request<User & { settings?: UserSettings }>("/api/users/me"),
    updateMe: (body: { 
      name?: string; 
      location?: string; 
      avatarUrl?: string | null;
      bio?: string;
      phone?: string;
      website?: string;
      twitter?: string;
      emailNotifications?: boolean;
    }) =>
      api.request<User>("/api/users/me", { method: "PATCH", body: JSON.stringify(body) }),
    deleteMe: () => api.request<{ message: string }>("/api/users/me", { method: "DELETE" }),
    activityLogs: () => api.request<UserActivityLog[]>("/api/users/activity"),
  },
  dashboard: {
    stats: () => api.request<DashboardStats>("/api/dashboard/stats"),
    yieldTrends: () => api.request<YieldTrendPoint[]>("/api/dashboard/yield-trends"),
    weather: () => api.request<WeatherPoint[]>("/api/dashboard/weather"),
    cropDistribution: () => api.request<CropDistributionPoint[]>("/api/dashboard/crop-distribution"),
    activity: () => api.request<ActivityItem[]>("/api/dashboard/activity"),
  },
  predictions: {
    list: () => api.request<Prediction[]>("/api/predictions"),
    create: (body: { fieldId?: string; cropType: string; predictedYield: number; unit?: string; notes?: string }) =>
      api.request<Prediction>("/api/predictions", { method: "POST", body: JSON.stringify(body) }),
    predictYield: (body: PredictYieldInput) =>
      api.request<Prediction & { suggestedImprovements?: string[] }>("/api/predictions/predict-yield", { method: "POST", body: JSON.stringify(body) }),
    getOne: (id: string) => api.request<Prediction>(`/api/predictions/${id}`),
    delete: (id: string) => api.request<{ message: string }>(`/api/predictions/${id}`, { method: "DELETE" }),
  },
  fields: {
    list: () => api.request<Field[]>("/api/fields"),
    create: (body: { name: string; area: string; location: string; cropType?: string }) =>
      api.request<Field>("/api/fields", { method: "POST", body: JSON.stringify(body) }),
    delete: (id: string) => api.request<{ message: string }>(`/api/fields/${id}`, { method: "DELETE" }),
  },
  planning: {
    list: () => api.request<PlanningTask[]>("/api/planning"),
    create: (body: { title: string; type: string; dueDate: string }) =>
      api.request<PlanningTask>("/api/planning", { method: "POST", body: JSON.stringify(body) }),
    toggle: (id: string) => api.request<PlanningTask>(`/api/planning/${id}/toggle`, { method: "PATCH" }),
    delete: (id: string) => api.request<{ message: string }>(`/api/planning/${id}`, { method: "DELETE" }),
  },
  weather: {
    get: () => api.request<WeatherData>("/api/weather"),
  },
  market: {
    getPrices: (location?: string) => api.request<MarketData>("/api/market/prices" + (location ? `?location=${encodeURIComponent(location)}` : ""))
  },
  chat: {
    send: (body: { message: string; context?: { avgYield?: number; temperatureC?: number; rainfallMm?: number; predictions?: number } }) => {
      // Create context string to append if context provided
      let content = body.message;
      if (body.context) {
        content += `\n\nContext: ${JSON.stringify(body.context)}`;
      }
      
      return api.request<{ reply: string }>("/api/ai/chat", { 
        method: "POST", 
        body: JSON.stringify({ 
          messages: [{ role: "user", content }] 
        }) 
      });
    },
    vision: (body: { image: string; mimeType: string }) => 
      api.request<{ diagnosis: any }>("/api/ai/vision", {
        method: "POST",
        body: JSON.stringify(body)
      })
  },
};

export interface User {
  id: string;
  email: string;
  name: string | null;
  location?: string | null;
  bio?: string | null;
  phone?: string | null;
  website?: string | null;
  twitter?: string | null;
  emailNotifications?: boolean;
  avatarUrl?: string | null;
  plan: string;
  createdAt: string;
}

export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  details: string | null;
  createdAt: string;
}

export interface UserSettings {
  emailNotifications: boolean;
  weatherAlerts: boolean;
  weeklyDigest: boolean;
  twoFactorEnabled: boolean;
  dataSharing: boolean;
  metricUnits: boolean;
  autoRefresh: boolean;
}

export interface DashboardStats {
  avgYield: string;
  avgYieldTrend: string;
  avgYieldTrendUp: boolean;
  temperature: string;
  tempTrend: string;
  tempTrendUp: boolean;
  rainfall: string;
  rainfallTrend: string;
  rainfallTrendUp: boolean;
  predictionsCount: string;
  predictionsTrend: string;
  predictionsTrendUp: boolean;
}

export interface YieldTrendPoint {
  month: string;
  rice: number;
  wheat: number;
  maize: number;
}

export interface WeatherPoint {
  day: string;
  temp: number;
  humidity: number;
  rain: number;
}

export interface CropDistributionPoint {
  name: string;
  value: number;
  color: string;
}

export interface ActivityItem {
  action: string;
  crop: string;
  time: string;
  icon: string;
}

export interface PredictYieldInput {
  fieldId?: string;
  fieldName?: string;
  fieldSizeHa?: number;
  soilType?: string;
  soilMoisture?: number;
  cropType: string;
  variety?: string;
  plantingDate?: string;
  temperature?: number;
  rainfall?: number;
  humidity?: number;
  fertilizerUsed?: boolean | string;
  irrigationType?: string;
  pestIncidents?: boolean | string;
}

export interface Prediction {
  id: string;
  userId: string;
  fieldId: string | null;
  cropType: string;
  predictedYield: number | string;
  unit: string;
  status: string;
  notes: string | null;
  confidenceScore?: number | null;
  riskLevel?: string | null;
  suggestions?: string | null;
  inputParams?: string | null;
  createdAt: string;
  field?: { name: string; location: string } | null;
}

export interface Field {
  id: string;
  userId: string;
  name: string;
  area: string;
  location: string;
  cropType: string;
  createdAt: string;
}

export interface PlanningTask {
  id: string;
  userId: string;
  title: string;
  type: string;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export interface WeatherData {
  location: string;
  current: { temp: number; humidity: number; condition: string; wind: number; pressure?: number };
  forecast: Array<{ day: string; temp: number; humidity?: number; rain: number; condition: string }>;
}

export interface MarketPrice {
  crop: string;
  pricePerQuintal: number;
  trend: 'up' | 'down';
  changePct: number;
}

export interface MarketData {
  location: string;
  prices: MarketPrice[];
  lastUpdated: string;
}
