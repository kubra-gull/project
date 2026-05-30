import { useState, useEffect } from "react";
import { store, ColdChainReading } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Thermometer, AlertTriangle, CheckCircle2, RefreshCw, Zap } from "lucide-react";

const UNITS = ["Frige-1", "Frige-2", "Frige-3"];

function TempGauge({ temp }: { temp: number }) {
  const min = -5, max = 15;
  const pct = Math.min(100, Math.max(0, ((temp - min) / (max - min)) * 100));
  const color = temp < 2 ? "#3B82F6" : temp <= 8 ? "#10B981" : temp <= 10 ? "#F59E0B" : "#EF4444";
  const angle = -135 + (pct / 100) * 270;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-20 overflow-hidden">
        <svg viewBox="0 0 100 60" className="w-full h-full">
          <path d="M 10 55 A 45 45 0 0 1 90 55" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeLinecap="round" />
          <path d="M 10 55 A 45 45 0 0 1 90 55" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * 141.4} 141.4`} />
          <g transform={`rotate(${angle}, 50, 55)`}>
            <line x1="50" y1="55" x2="50" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <circle cx="50" cy="55" r="3" fill={color} />
          </g>
          <text x="10" y="62" fontSize="6" fill="hsl(var(--muted-foreground))">-5°</text>
          <text x="85" y="62" fontSize="6" fill="hsl(var(--muted-foreground))">15°</text>
        </svg>
      </div>
      <div className="text-3xl font-bold" style={{ color }}>{temp.toFixed(1)}°C</div>
    </div>
  );
}

export default function ColdChain() {
  const [readings, setReadings] = useState(store.getColdChainReadings());
  const [alerts, setAlerts] = useState<string[]>([]);

  const simulateReading = () => {
    const newReadings = UNITS.map(unitId => {
      const temp = 1 + Math.random() * 10;
      const status: ColdChainReading["status"] = temp < 2 || temp > 8 ? (temp > 10 ? "Critical" : "Warning") : "Safe";
      const reading: ColdChainReading = {
        id: `cc${Date.now()}-${unitId}`,
        unitId,
        temperature: parseFloat(temp.toFixed(1)),
        timestamp: new Date().toISOString(),
        status,
      };
      store.saveColdChainReading(reading);
      if (status !== "Safe") {
        setAlerts(prev => [`${unitId}: ${temp.toFixed(1)}°C — ${status}`, ...prev.slice(0, 9)]);
      }
      return reading;
    });
    setReadings(store.getColdChainReadings());
  };

  useEffect(() => {
    const interval = setInterval(simulateReading, 10000);
    return () => clearInterval(interval);
  }, []);

  const latestPerUnit = UNITS.map(unitId => {
    const unitReadings = readings.filter(r => r.unitId === unitId);
    return unitReadings[unitReadings.length - 1];
  }).filter(Boolean) as ColdChainReading[];

  const chartData = readings.slice(-24).map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    temp: parseFloat(r.temperature.toFixed(1)),
    unit: r.unitId,
  }));

  const unit1Data = readings.filter(r => r.unitId === "Frige-1").slice(-12).map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    temp: parseFloat(r.temperature.toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Cold Chain Monitoring</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Real-time temperature surveillance (2–8°C safe range)</p>
        </div>
        <Button variant="outline" onClick={simulateReading} data-testid="button-refresh-temp">
          <RefreshCw className="h-4 w-4 mr-2" /> Simulate Reading
        </Button>
      </div>

      {/* Unit Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {latestPerUnit.map(reading => {
          const statusColors = {
            Safe: { bg: "bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-900", text: "text-emerald-600 dark:text-emerald-400", icon: CheckCircle2 },
            Warning: { bg: "bg-amber-500/10", border: "border-amber-200 dark:border-amber-900", text: "text-amber-600 dark:text-amber-400", icon: AlertTriangle },
            Critical: { bg: "bg-red-500/10", border: "border-red-200 dark:border-red-900", text: "text-red-600 dark:text-red-400", icon: Zap },
          };
          const sc = statusColors[reading.status];
          const StatusIcon = sc.icon;
          return (
            <Card key={reading.unitId} className={`border ${sc.border}`} data-testid={`cold-chain-unit-${reading.unitId}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">{reading.unitId}</CardTitle>
                  <Badge className={`${sc.bg} ${sc.text} border-0 text-xs`}>
                    <StatusIcon className="h-3 w-3 mr-1" />{reading.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <TempGauge temp={reading.temperature} />
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Safe range</span><span className="font-medium text-foreground">2°C – 8°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last updated</span>
                    <span className="font-medium text-foreground">{new Date(reading.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Temperature Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Thermometer className="h-4 w-4" /> Temperature History — Last 24 Readings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={unit1Data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="time" tick={{ fontSize: 11 }} />
              <YAxis domain={[-2, 14]} tick={{ fontSize: 11 }} unit="°C" />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }}
                formatter={(val: number) => [`${val}°C`, "Temperature"]}
              />
              <ReferenceLine y={2} stroke="#3B82F6" strokeDasharray="4 4" label={{ value: "Min 2°C", position: "insideTopLeft", fontSize: 10, fill: "#3B82F6" }} />
              <ReferenceLine y={8} stroke="#EF4444" strokeDasharray="4 4" label={{ value: "Max 8°C", position: "insideTopLeft", fontSize: 10, fill: "#EF4444" }} />
              <Line type="monotone" dataKey="temp" stroke="hsl(221,83%,53%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Alert Log */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" /> Alert Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-2 py-4 text-emerald-500">
              <CheckCircle2 className="h-5 w-5" />
              <p className="text-sm font-medium">All units operating within safe temperature range</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-red-500/5 border border-red-200 dark:border-red-900">
                  <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{a}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
