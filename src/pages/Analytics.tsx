import { motion } from "framer-motion";
import { Sprout, CloudRain, Target, Calendar } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const monthlyYield = [
  { month: "Sep", actual: 3200, predicted: 3100 },
  { month: "Oct", actual: 3400, predicted: 3350 },
  { month: "Nov", actual: 3100, predicted: 3200 },
  { month: "Dec", actual: 2800, predicted: 2900 },
  { month: "Jan", actual: 3600, predicted: 3500 },
  { month: "Feb", actual: 3900, predicted: 3800 },
  { month: "Mar", actual: 0, predicted: 4100 },
];

const soilData = [
  { param: "pH", value: 6.8 },
  { param: "N", value: 85 },
  { param: "P", value: 42 },
  { param: "K", value: 68 },
  { param: "OC", value: 1.2 },
  { param: "Fe", value: 4.5 },
];

const AnalyticsPage = () => (
  <>
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, label: "Model Accuracy", value: "94.2%", trend: "+1.3%", up: true },
          { icon: Sprout, label: "Active Crops", value: "8", trend: "+2", up: true },
          { icon: CloudRain, label: "Rain Forecast", value: "124mm", trend: "-12%", up: false },
          { icon: Calendar, label: "Next Harvest", value: "42 days", trend: "On track", up: true },
        ].map((s) => (
          <motion.div key={s.label} whileHover={{ y: -2 }} transition={{ duration: 0.15 }} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <span className={`text-xs font-medium tabular-nums ${s.up ? "text-primary" : "text-destructive"}`}>{s.trend}</span>
            </div>
            <p className="label-mono mb-1">{s.label}</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Prediction vs Actual */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stat-card !p-0">
        <div className="p-5 pb-0">
          <p className="label-mono mb-1">Prediction vs Actual</p>
          <p className="text-lg font-bold">Yield Comparison (kg/ha)</p>
        </div>
        <div className="h-72 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyYield}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120, 10%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 46%)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Line type="monotone" dataKey="actual" stroke="hsl(142, 64%, 36%)" strokeWidth={2.5} dot={{ r: 4 }} name="Actual" />
              <Line type="monotone" dataKey="predicted" stroke="hsl(200, 80%, 55%)" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4 }} name="Predicted" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Soil Analysis */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card !p-0">
        <div className="p-5 pb-0">
          <p className="label-mono mb-1">Soil Analysis</p>
          <p className="text-lg font-bold">Key Parameters</p>
        </div>
        <div className="h-56 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={soilData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120, 10%, 90%)" />
              <XAxis dataKey="param" tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 46%)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Bar dataKey="value" fill="hsl(42, 92%, 56%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  </>
);

export default AnalyticsPage;
