import { useState, useEffect } from "react";
import { store } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  Users, CheckCircle2, Clock, Package, AlertTriangle, CalendarCheck,
  TrendingUp, Percent, Thermometer, Activity, ChevronRight
} from "lucide-react";

const CHART_COLORS = ["hsl(221,83%,53%)", "hsl(199,89%,48%)", "hsl(172,66%,50%)", "hsl(142,71%,45%)", "hsl(38,92%,50%)"];

const MONTHLY_DATA = [
  { month: "Jan", vaccinations: 320 }, { month: "Feb", vaccinations: 450 }, { month: "Mar", vaccinations: 380 },
  { month: "Apr", vaccinations: 520 }, { month: "May", vaccinations: 490 }, { month: "Jun", vaccinations: 600 },
  { month: "Jul", vaccinations: 550 }, { month: "Aug", vaccinations: 680 }, { month: "Sep", vaccinations: 720 },
  { month: "Oct", vaccinations: 650 }, { month: "Nov", vaccinations: 780 }, { month: "Dec", vaccinations: 820 },
];

const DISEASE_DATA = [
  { disease: "Polio", coverage: 94 }, { disease: "Measles", coverage: 87 }, { disease: "BCG", coverage: 98 },
  { disease: "DPT", coverage: 82 }, { disease: "PCV", coverage: 76 }, { disease: "Rotavirus", coverage: 68 },
  { disease: "Typhoid", coverage: 71 }, { disease: "Rubella", coverage: 84 },
];

export default function Dashboard() {
  const [patients, setPatients] = useState(store.getPatients());
  const [vaccines, setVaccines] = useState(store.getVaccines());
  const [records, setRecords] = useState(store.getVaccinationRecords());
  const [coldChain, setColdChain] = useState(store.getColdChainReadings());

  useEffect(() => {
    setPatients(store.getPatients());
    setVaccines(store.getVaccines());
    setRecords(store.getVaccinationRecords());
    setColdChain(store.getColdChainReadings());
  }, []);

  const totalStock = vaccines.reduce((a, v) => a + v.stock, 0);
  const expiredVaccines = vaccines.filter(v => v.expiry && new Date(v.expiry) < new Date()).length;
  const lowStock = vaccines.filter(v => v.stock < 100).length;
  const today = new Date().toISOString().split("T")[0];
  const todayRecords = records.filter(r => r.date.startsWith(today)).length;
  const fullyVaccinated = Math.floor(patients.length * 0.62);
  const coveragePct = patients.length ? Math.round((fullyVaccinated / patients.length) * 100) : 0;
  const latestTemp = coldChain.length ? coldChain[coldChain.length - 1].temperature.toFixed(1) : "4.2";
  const coldChainOk = coldChain.filter(r => r.status === "Safe").length === coldChain.length;

  const vaccineUsageData = vaccines.map(v => ({ name: v.name.split(" ")[0], value: v.used || 0 }));

  const recentActivity = [
    { action: "Vaccination recorded", patient: "Child 3", vaccine: "Polio (OPV)", time: "5 min ago" },
    { action: "New patient registered", patient: "Child 26", vaccine: "-", time: "18 min ago" },
    { action: "Stock updated", patient: "-", vaccine: "BCG +50 doses", time: "1 hr ago" },
    { action: "Cold chain alert cleared", patient: "-", vaccine: "Fridge 2", time: "2 hr ago" },
    { action: "Vaccination recorded", patient: "Child 11", vaccine: "Measles (MCV1)", time: "3 hr ago" },
  ];

  const upcomingAlerts = patients.slice(0, 5).map((p, i) => ({
    name: p.name,
    vaccine: vaccines[i % vaccines.length]?.name.split("(")[0].trim(),
    dueIn: `${i + 1} day${i !== 0 ? "s" : ""}`,
  }));

  const statCards = [
    { title: "Registered Children", value: patients.length, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", change: "+5 this week" },
    { title: "Fully Vaccinated", value: fullyVaccinated, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", change: `${coveragePct}% coverage` },
    { title: "Pending Vaccinations", value: patients.length - fullyVaccinated, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", change: "Due this month" },
    { title: "Total Vaccine Stock", value: totalStock, icon: Package, color: "text-indigo-500", bg: "bg-indigo-500/10", change: `${vaccines.length} types` },
    { title: "Expired Batches", value: expiredVaccines, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10", change: "Requires action" },
    { title: "Today's Vaccinations", value: todayRecords, icon: CalendarCheck, color: "text-cyan-500", bg: "bg-cyan-500/10", change: "Updated live" },
    { title: "Monthly Vaccinations", value: 820, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10", change: "+12% vs last month" },
    { title: "Coverage Rate", value: `${coveragePct}%`, icon: Percent, color: "text-teal-500", bg: "bg-teal-500/10", change: "National target: 90%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Executive Dashboard</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Live overview of immunization operations</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="border bg-card backdrop-blur-sm" data-testid={`card-stat-${stat.title.toLowerCase().replace(/\s/g, "-")}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs font-medium text-muted-foreground mt-0.5">{stat.title}</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Monthly Vaccination Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={MONTHLY_DATA}>
                <defs>
                  <linearGradient id="colorVacc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <YAxis tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Area type="monotone" dataKey="vaccinations" stroke={CHART_COLORS[0]} fill="url(#colorVacc)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Disease Coverage (%)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={DISEASE_DATA} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="disease" tick={{ fontSize: 11 }} width={70} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Bar dataKey="coverage" fill={CHART_COLORS[0]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Vaccine Usage Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={vaccineUsageData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {vaccineUsageData.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                <Legend iconType="circle" iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.patient !== "-" ? item.patient : item.vaccine} · {item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Upcoming Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock > 0 && (
              <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-600 dark:text-amber-400">{lowStock} vaccine type{lowStock !== 1 ? "s" : ""} running low on stock</p>
              </div>
            )}
            <div className={`flex items-center gap-2 p-2 rounded-lg ${coldChainOk ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-red-500/10 border border-red-500/20"}`}>
              <Thermometer className={`h-4 w-4 ${coldChainOk ? "text-emerald-500" : "text-red-500"} shrink-0`} />
              <p className={`text-xs ${coldChainOk ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                Cold chain: {latestTemp}°C — {coldChainOk ? "All units normal" : "Alert active"}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Due for vaccination</p>
              {upcomingAlerts.map((alert, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{alert.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{alert.vaccine}</span>
                    <Badge variant="outline" className="text-xs py-0">{alert.dueIn}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Inventory Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {vaccines.map((v) => {
              const total = v.stock + (v.used || 0);
              const pct = total > 0 ? Math.round((v.stock / total) * 100) : 0;
              const isLow = v.stock < 100;
              return (
                <div key={v.id} className="space-y-1.5" data-testid={`inventory-${v.id}`}>
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground truncate">{v.name.split("(")[0].trim()}</span>
                    <span className={`font-semibold ${isLow ? "text-red-500" : "text-foreground"}`}>{v.stock}</span>
                  </div>
                  <Progress value={pct} className={`h-2 ${isLow ? "[&>div]:bg-red-500" : ""}`} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{pct}% remaining</span>
                    {isLow && <span className="text-amber-500 font-medium">Low</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
