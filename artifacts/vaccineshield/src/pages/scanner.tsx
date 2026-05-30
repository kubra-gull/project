import { useState } from "react";
import { store, Vaccine } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScanLine, CheckCircle2, AlertTriangle, Package, Calendar, Hash, Clock } from "lucide-react";

interface ScanResult {
  vaccine: Vaccine;
  scannedAt: string;
  verified: boolean;
}

export default function Scanner() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const vaccines = store.getVaccines();

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      const vaccine = vaccines[Math.floor(Math.random() * vaccines.length)];
      const isExpired = vaccine.expiry ? new Date(vaccine.expiry) < new Date() : false;
      const sr: ScanResult = {
        vaccine,
        scannedAt: new Date().toISOString(),
        verified: !isExpired && vaccine.stock > 0,
      };
      setResult(sr);
      setHistory(prev => [sr, ...prev.slice(0, 9)]);
      setScanning(false);
      store.addAuditEntry({ userId: store.getCurrentUser()?.id || "", action: "SCAN", details: `Scanned batch ${vaccine.batch} (${vaccine.name})` });
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">QR & Barcode Scanner</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Batch verification and vaccine authentication</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner UI */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ScanLine className="h-4 w-4" /> Scanner Interface
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6 py-6">
            {/* Scanning Frame */}
            <div className="relative w-56 h-56 flex items-center justify-center bg-muted/30 rounded-2xl border-2 border-dashed border-border overflow-hidden">
              {scanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                  <div
                    className="absolute w-full h-0.5 bg-primary opacity-80 animate-bounce"
                    style={{ top: "30%", animationDuration: "0.8s" }}
                  />
                  <p className="text-xs text-primary font-medium mt-8">Scanning...</p>
                </div>
              )}
              {/* Corner brackets */}
              {["top-2 left-2 border-t-2 border-l-2", "top-2 right-2 border-t-2 border-r-2", "bottom-2 left-2 border-b-2 border-l-2", "bottom-2 right-2 border-b-2 border-r-2"].map((cls, i) => (
                <div key={i} className={`absolute w-6 h-6 border-primary ${cls}`} />
              ))}
              {!scanning && !result && (
                <div className="text-center p-4">
                  <ScanLine className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                  <p className="text-xs text-muted-foreground">Position barcode/QR<br />within frame</p>
                </div>
              )}
              {!scanning && result && (
                <div className="flex flex-col items-center gap-2">
                  {result.verified
                    ? <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    : <AlertTriangle className="h-12 w-12 text-red-500" />
                  }
                  <p className={`text-sm font-bold ${result.verified ? "text-emerald-500" : "text-red-500"}`}>
                    {result.verified ? "Verified" : "Alert"}
                  </p>
                </div>
              )}
            </div>
            <Button
              onClick={handleScan}
              disabled={scanning}
              className="w-40"
              data-testid="button-scan"
            >
              <ScanLine className="h-4 w-4 mr-2" />
              {scanning ? "Scanning..." : "Scan Batch"}
            </Button>
          </CardContent>
        </Card>

        {/* Scan Result */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Scan Result</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground gap-2">
                <Package className="h-10 w-10 opacity-20" />
                <p className="text-sm">No scan yet — press Scan Batch to begin</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${result.verified ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                    {result.verified
                      ? <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      : <AlertTriangle className="h-6 w-6 text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{result.vaccine.name}</p>
                    <Badge variant="outline" className={`text-xs mt-1 ${result.verified ? "text-emerald-500 border-emerald-300" : "text-red-500 border-red-300"}`}>
                      {result.verified ? "Authenticated" : "Verification Failed"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Hash, label: "Batch Number", value: result.vaccine.batch || "N/A" },
                    { icon: Calendar, label: "Expiry Date", value: result.vaccine.expiry || "N/A" },
                    { icon: Package, label: "Available Qty", value: `${result.vaccine.stock} doses` },
                    { icon: Clock, label: "Scanned At", value: new Date(result.scannedAt).toLocaleTimeString() },
                  ].map(item => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                          <p className="text-sm font-medium text-foreground">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scan History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Scan History</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No scans recorded in this session</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vaccine</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Scanned At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((h, i) => (
                  <TableRow key={i} data-testid={`scan-history-${i}`}>
                    <TableCell className="font-medium text-sm">{h.vaccine.name}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{h.vaccine.batch || "—"}</TableCell>
                    <TableCell className="text-sm">{h.vaccine.expiry || "—"}</TableCell>
                    <TableCell className="text-sm">{h.vaccine.stock}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(h.scannedAt).toLocaleTimeString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${h.verified ? "text-emerald-500 border-emerald-300" : "text-red-500 border-red-300"}`}>
                        {h.verified ? "Verified" : "Failed"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
