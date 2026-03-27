import { motion } from "framer-motion";
import { Users, TrendingUp, DollarSign, Activity, Search, MoreHorizontal, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
  { month: "Jan", revenue: 45000, users: 120 },
  { month: "Feb", revenue: 52000, users: 180 },
  { month: "Mar", revenue: 68000, users: 250 },
  { month: "Apr", revenue: 73000, users: 310 },
  { month: "May", revenue: 89000, users: 420 },
  { month: "Jun", revenue: 95000, users: 510 },
];

const users = [
  { name: "Rajesh Patel", email: "rajesh@farm.in", plan: "Pro", status: "Active", predictions: 142 },
  { name: "Priya Sharma", email: "priya@agri.org", plan: "Enterprise", status: "Active", predictions: 89 },
  { name: "Kamal Singh", email: "kamal@wheat.co", plan: "Free", status: "Active", predictions: 23 },
  { name: "Anita Desai", email: "anita@fields.in", plan: "Pro", status: "Inactive", predictions: 67 },
  { name: "Ravi Kumar", email: "ravi@harvest.ai", plan: "Pro", status: "Active", predictions: 201 },
];

const AdminPanel = () => (
  <>
    <div className="space-y-6 pt-4">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Users, label: "Total Users", value: "10,247", trend: "+12%" },
          { icon: TrendingUp, label: "Predictions", value: "48,392", trend: "+28%" },
          { icon: DollarSign, label: "Revenue", value: "₹9.5L", trend: "+18%" },
          { icon: Activity, label: "API Calls", value: "1.2M", trend: "+35%" },
        ].map((s) => (
          <motion.div key={s.label} whileHover={{ y: -2 }} transition={{ duration: 0.15 }} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-medium text-primary tabular-nums">{s.trend}</span>
            </div>
            <p className="label-mono mb-1">{s.label}</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="stat-card !p-0">
        <div className="p-5 pb-0">
          <p className="label-mono mb-1">Revenue</p>
          <p className="text-lg font-bold">Monthly Growth</p>
        </div>
        <div className="h-64 p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 64%, 36%)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="hsl(142, 64%, 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(120, 10%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 46%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(150, 8%, 46%)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(142, 64%, 36%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Users Table */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="stat-card !p-0">
        <div className="p-5 pb-3 flex items-center justify-between">
          <div>
            <p className="label-mono mb-1">Users</p>
            <p className="text-lg font-bold">User Management</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-8 h-8 w-48 text-xs" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-t border-border">
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Plan</th>
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Predictions</th>
                <th className="px-5 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.email} className="border-t border-border hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      u.plan === "Enterprise" ? "bg-primary/10 text-primary" :
                      u.plan === "Pro" ? "bg-sun-gold/10 text-sun-gold" :
                      "bg-secondary text-muted-foreground"
                    }`}>{u.plan}</span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${u.status === "Active" ? "text-primary" : "text-muted-foreground"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm tabular-nums">{u.predictions}</td>
                  <td className="px-5 py-3">
                    <Button variant="ghost" size="sm" className="p-1"><MoreHorizontal className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  </>
);

export default AdminPanel;
