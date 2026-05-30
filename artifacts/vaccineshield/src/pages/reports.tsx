import { useState } from "react";
import { store } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, Download, Printer, Calendar, TrendingUp, Shield, Package, Thermometer } from "lucide-react";

const MONTHLY = [
  { month: "Jan", vaccinations: 320, target: 380 }, { month: "Feb", vaccinations: 450, target: 400 },
  { month: "Mar", vaccinations: 380, target: 420 }, { month: "Apr", vaccinations: 520, target: 450 },
  { month: "May", vaccinations: 490, target: 470 }, { month: "Jun", vaccinations: 600, target: 500 },
];

function downloadCSV(filename: string, data: Record<string, string | number>[]) {
  const keys = Object.keys(data[0]);
  const csv = [keys.join(","), ...data.map(row => keys.map(k => row[k]).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const patients = store.getPatients();
  const vaccines = store.getVaccines();
  const records = store.getVaccinationRecords();
  const auditLog = store.getAuditLog();
  const coldChain = store.getColdChainReadings();

  const handleExportCSV = (type: string) => {
    if (type === "patients") {
      downloadCSV("patients.csv", patients.map(p => ({ id: p.id, name: p.name, district: p.district, dob: p.dob, gender: p.gender })));
    } else if (type === "vaccines") {
      downloadCSV("inventory.csv", vaccines.map(v => ({ id: v.id, name: v.name, stock: v.stock, batch: v.batch || "", expiry: v.expiry || "" })));
    } else if (type === "records") {
      downloadCSV("vaccinations.csv", records.map(r => ({ id: r.id, patientId: r.patientId, vaccineId: r.vaccineId, date: r.date, by: r.administeredBy })));
    } else if (type === "audit") {
      downloadCSV("audit.csv", auditLog.map(a => ({ id: a.id, timestamp: a.timestamp, userId: a.userId, action: a.action, details: a.details })));
    }
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6" id="report-content">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Reports & Audit Center</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Generate operational and public health reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} data-testid="button-print-report">
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
        </div>
      </div>

      <Tabs defaultValue="operational">
        <TabsList>
          <TabsTrigger value="operational" data-testid="tab-operational"><TrendingUp className="h-3.5 w-3.5 mr-1" />Operational</TabsTrigger>
          <TabsTrigger value="health" data-testid="tab-health"><Shield className="h-3.5 w-3.5 mr-1" />Public Health</TabsTrigger>
          <TabsTrigger value="stock" data-testid="tab-stock"><Package className="h-3.5 w-3.5 mr-1" />Stock Usage</TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit"><FileText className="h-3.5 w-3.5 mr-1" />Audit Trail</TabsTrigger>
        </TabsList>

        {/* Operational */}
        <TabsContent value="operational" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => handleExportCSV("records")} data-testid="button-export-records">
              <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Total Patients", value: patients.length },
              { label: "Vaccinations Given", value: records.length },
              { label: "Today's Sessions", value: records.filter(r => r.date === new Date().toISOString().split("T")[0]).length },
              { label: "Coverage Rate", value: `${patients.length ? Math.round((records.length / patients.length) * 100) : 0}%` },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-3">
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Monthly Vaccination vs Target</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="vaccinations" fill="hsl(221,83%,53%)" radius={[4, 4, 0, 0]} name="Actual" />
                  <Bar dataKey="target" fill="hsl(199,89%,48%)" radius={[4, 4, 0, 0]} name="Target" opacity={0.6} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Public Health */}
        <TabsContent value="health" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => handleExportCSV("patients")} data-testid="button-export-health">
              <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaccines.map(v => {
              const vaccineRecords = records.filter(r => r.vaccineId === v.id);
              const coverage = patients.length ? Math.round((vaccineRecords.length / patients.length) * 100) : 0;
              return (
                <Card key={v.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm text-foreground">{v.name}</p>
                      <Badge variant="outline" className={`text-xs ${coverage >= 80 ? "text-emerald-500 border-emerald-300" : coverage >= 60 ? "text-amber-500 border-amber-300" : "text-red-500 border-red-300"}`}>
                        {coverage}% coverage
                      </Badge>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(coverage, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{vaccineRecords.length} doses given</span>
                      <span>Target: {patients.length} children</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Stock Usage */}
        <TabsContent value="stock" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => handleExportCSV("vaccines")} data-testid="button-export-stock">
              <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaccine</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Opening Stock</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Remaining</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vaccines.map(v => {
                const isExpired = v.expiry ? new Date(v.expiry) < new Date() : false;
                return (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium text-sm">{v.name}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{v.batch || "—"}</TableCell>
                    <TableCell className="text-sm">{v.stock + (v.used || 0)}</TableCell>
                    <TableCell className="text-sm">{v.used || 0}</TableCell>
                    <TableCell className="text-sm font-semibold">{v.stock}</TableCell>
                    <TableCell className="text-sm">{v.expiry || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${isExpired ? "text-red-500 border-red-300" : v.stock < 100 ? "text-amber-500 border-amber-300" : "text-emerald-500 border-emerald-300"}`}>
                        {isExpired ? "Expired" : v.stock < 100 ? "Low" : "Normal"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Audit Trail */}
        <TabsContent value="audit" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => handleExportCSV("audit")} data-testid="button-export-audit">
              <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
            </Button>
          </div>
          {auditLog.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><p className="text-sm">No audit entries yet</p></CardContent></Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...auditLog].reverse().map(entry => (
                  <TableRow key={entry.id} data-testid={`audit-row-${entry.id}`}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{new Date(entry.timestamp).toLocaleString()}</TableCell>
                    <TableCell className="text-sm">{entry.userId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-mono">{entry.action}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
