import { useState } from "react";
import { store, Reconciliation } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ClipboardCheck, AlertTriangle, CheckCircle2, TrendingDown, FileText } from "lucide-react";

export default function ReconciliationPage() {
  const [reconciliations, setReconciliations] = useState(store.getReconciliations());
  const vaccines = store.getVaccines();
  const user = store.getCurrentUser();
  const [selectedVaccine, setSelectedVaccine] = useState("");
  const [form, setForm] = useState({ opening: 0, administered: 0, physicalCount: 0 });
  const [showApprove, setShowApprove] = useState<Reconciliation | null>(null);

  const vaccine = vaccines.find(v => v.id === selectedVaccine);
  const remaining = form.opening - form.administered;
  const variance = form.physicalCount - remaining;

  const handleSubmit = () => {
    if (!selectedVaccine) return;
    const rec: Reconciliation = {
      id: `rec${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      submittedBy: user?.name || "Unknown",
      openingStock: form.opening,
      administered: form.administered,
      remaining,
      physicalCount: form.physicalCount,
      variance,
      approved: false,
    };
    store.saveReconciliation(rec);
    store.addAuditEntry({ userId: user?.id || "", action: "RECONCILE", details: `EOD reconciliation submitted for ${vaccine?.name}, variance: ${variance}` });
    setReconciliations(store.getReconciliations());
    setForm({ opening: 0, administered: 0, physicalCount: 0 });
    setSelectedVaccine("");
  };

  const handleApprove = (rec: Reconciliation) => {
    const all = store.getReconciliations();
    const idx = all.findIndex(r => r.id === rec.id);
    if (idx >= 0) {
      all[idx].approved = true;
      localStorage.setItem("vs_reconciliations", JSON.stringify(all));
    }
    store.addAuditEntry({ userId: user?.id || "", action: "APPROVE_RECONCILIATION", details: `Approved reconciliation ${rec.id}` });
    setReconciliations(store.getReconciliations());
    setShowApprove(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">End of Day Reconciliation</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Shift closing, stock count and variance reporting</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reconciliation Form */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4" /> Daily Reconciliation Form
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Select Vaccine</Label>
              <Select value={selectedVaccine} onValueChange={setSelectedVaccine}>
                <SelectTrigger data-testid="select-reconcile-vaccine"><SelectValue placeholder="Choose vaccine..." /></SelectTrigger>
                <SelectContent>
                  {vaccines.map(v => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {selectedVaccine && (
              <div className="p-2 rounded bg-muted/40 text-xs text-muted-foreground">
                Current system stock: <span className="font-semibold text-foreground">{vaccine?.stock} doses</span>
              </div>
            )}
            {[
              { id: "opening", label: "Opening Stock (start of shift)", key: "opening" },
              { id: "administered", label: "Vaccines Administered", key: "administered" },
              { id: "physicalCount", label: "Physical Count (end of shift)", key: "physicalCount" },
            ].map(f => (
              <div key={f.id}>
                <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
                <Input
                  id={f.id}
                  type="number"
                  min={0}
                  value={(form as Record<string, number>)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: Number(e.target.value) })}
                  data-testid={`input-${f.id}`}
                />
              </div>
            ))}

            {(form.opening > 0 || form.physicalCount > 0) && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Auto-Calculated</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Expected Remaining</p>
                    <p className="font-semibold text-foreground">{remaining} doses</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Variance</p>
                    <p className={`font-semibold ${variance === 0 ? "text-emerald-500" : variance > 0 ? "text-amber-500" : "text-red-500"}`}>
                      {variance > 0 ? "+" : ""}{variance} doses
                    </p>
                  </div>
                </div>
                {variance !== 0 && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-3 w-3" />
                    {variance > 0 ? "Surplus detected — verify count" : "Deficit detected — requires explanation"}
                  </div>
                )}
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={!selectedVaccine || form.opening === 0}
              data-testid="button-submit-reconciliation"
            >
              <ClipboardCheck className="h-4 w-4 mr-2" /> Submit EOD Report
            </Button>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Reports Submitted", value: reconciliations.filter(r => r.date === new Date().toISOString().split("T")[0]).length },
                { label: "Pending Approval", value: reconciliations.filter(r => !r.approved).length },
                { label: "Total Administered Today", value: reconciliations.filter(r => r.date === new Date().toISOString().split("T")[0]).reduce((a, r) => a + r.administered, 0) },
                { label: "Variances Detected", value: reconciliations.filter(r => r.variance !== 0).length },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <span className="font-semibold text-foreground">{s.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {user?.role === "Supervisor" || user?.role === "Administrator" ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                {reconciliations.filter(r => !r.approved).length === 0 ? (
                  <div className="flex items-center gap-2 text-emerald-500 py-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <p className="text-sm">All reports approved</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reconciliations.filter(r => !r.approved).map(r => (
                      <div key={r.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-500/5 border border-amber-200 dark:border-amber-900">
                        <div>
                          <p className="text-sm font-medium text-foreground">{r.submittedBy}</p>
                          <p className="text-xs text-muted-foreground">{r.date} · Variance: {r.variance}</p>
                        </div>
                        <Button size="sm" onClick={() => setShowApprove(r)} data-testid={`button-approve-${r.id}`}>Approve</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileText className="h-4 w-4" /> Reconciliation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reconciliations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No reconciliation records yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead>Opening</TableHead>
                  <TableHead>Administered</TableHead>
                  <TableHead>Physical Count</TableHead>
                  <TableHead>Variance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...reconciliations].reverse().map(r => (
                  <TableRow key={r.id} data-testid={`reconcile-row-${r.id}`}>
                    <TableCell className="text-sm">{r.date}</TableCell>
                    <TableCell className="text-sm">{r.submittedBy}</TableCell>
                    <TableCell className="text-sm">{r.openingStock}</TableCell>
                    <TableCell className="text-sm">{r.administered}</TableCell>
                    <TableCell className="text-sm">{r.physicalCount}</TableCell>
                    <TableCell className={`text-sm font-semibold ${r.variance === 0 ? "text-emerald-500" : r.variance > 0 ? "text-amber-500" : "text-red-500"}`}>
                      {r.variance > 0 ? "+" : ""}{r.variance}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${r.approved ? "text-emerald-500 border-emerald-300" : "text-amber-500 border-amber-300"}`}>
                        {r.approved ? "Approved" : "Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approval Dialog */}
      <Dialog open={!!showApprove} onOpenChange={() => setShowApprove(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Supervisor Approval</DialogTitle></DialogHeader>
          {showApprove && (
            <div className="space-y-4 mt-2">
              <div className="space-y-2 text-sm">
                <p>Submitted by: <span className="font-semibold">{showApprove.submittedBy}</span></p>
                <p>Date: <span className="font-semibold">{showApprove.date}</span></p>
                <p>Administered: <span className="font-semibold">{showApprove.administered} doses</span></p>
                <p>Variance: <span className={`font-semibold ${showApprove.variance === 0 ? "text-emerald-500" : "text-amber-500"}`}>{showApprove.variance}</span></p>
              </div>
              <p className="text-sm text-muted-foreground">By approving, you digitally sign off on this EOD reconciliation report.</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowApprove(null)}>Cancel</Button>
                <Button onClick={() => handleApprove(showApprove)} data-testid="button-confirm-approve">Approve & Sign Off</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
