import { useState } from "react";
import { store, Vaccine } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Plus, Edit2, AlertTriangle, CheckCircle2, Clock, TrendingDown } from "lucide-react";

export default function Inventory() {
  const [vaccines, setVaccines] = useState(store.getVaccines());
  const [showAdd, setShowAdd] = useState(false);
  const [editVaccine, setEditVaccine] = useState<Vaccine | null>(null);
  const [form, setForm] = useState({ name: "", stock: 0, batch: "", expiry: "", reserved: 0 });
  const [addQty, setAddQty] = useState(0);

  const refresh = () => setVaccines(store.getVaccines());

  const totalStock = vaccines.reduce((a, v) => a + v.stock, 0);
  const totalReserved = vaccines.reduce((a, v) => a + (v.reserved || 0), 0);
  const expiredCount = vaccines.filter(v => v.expiry && new Date(v.expiry) < new Date()).length;
  const available = totalStock - totalReserved;

  const getStatus = (v: Vaccine) => {
    if (v.expiry && new Date(v.expiry) < new Date()) return "expired";
    const daysLeft = v.expiry ? Math.floor((new Date(v.expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 999;
    if (v.stock < 100 || daysLeft < 30) return "warning";
    return "ok";
  };

  const handleSaveNew = () => {
    const newVaccine: Vaccine = {
      id: `v${Date.now()}`,
      name: form.name,
      stock: form.stock,
      batch: form.batch,
      expiry: form.expiry,
      reserved: form.reserved,
      used: 0,
    };
    store.saveVaccine(newVaccine);
    store.addAuditEntry({ userId: store.getCurrentUser()?.id || "", action: "ADD_VACCINE", details: `Added ${newVaccine.name} (${newVaccine.stock} doses)` });
    refresh();
    setShowAdd(false);
    setForm({ name: "", stock: 0, batch: "", expiry: "", reserved: 0 });
  };

  const handleUpdateStock = () => {
    if (!editVaccine) return;
    store.updateVaccineStock(editVaccine.id, addQty);
    store.addAuditEntry({ userId: store.getCurrentUser()?.id || "", action: "UPDATE_STOCK", details: `${editVaccine.name} stock adjusted by ${addQty}` });
    refresh();
    setEditVaccine(null);
    setAddQty(0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Vaccine Inventory</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Warehouse management and batch tracking</p>
        </div>
        <Button onClick={() => setShowAdd(true)} data-testid="button-add-vaccine">
          <Plus className="h-4 w-4 mr-2" /> Add Stock
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Stock", value: totalStock, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Available", value: available, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Reserved", value: totalReserved, icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Expired Batches", value: expiredCount, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Vaccine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {vaccines.map(v => {
          const status = getStatus(v);
          const total = v.stock + (v.used || 0);
          const pct = total > 0 ? Math.round((v.stock / total) * 100) : 0;
          return (
            <Card key={v.id} className={`relative border ${status === "expired" ? "border-red-200 dark:border-red-900" : status === "warning" ? "border-amber-200 dark:border-amber-900" : ""}`} data-testid={`vaccine-card-${v.id}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm leading-tight">{v.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Batch: {v.batch || "N/A"}</p>
                  </div>
                  <Badge
                    className={`text-xs shrink-0 ${status === "expired" ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-200" : status === "warning" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200"}`}
                    variant="outline"
                  >
                    {status === "expired" ? "Expired" : status === "warning" ? "Low/Expiring" : "Active"}
                  </Badge>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Stock level</span>
                      <span className="font-semibold text-foreground">{v.stock} doses</span>
                    </div>
                    <Progress value={pct} className={`h-2 ${status === "expired" ? "[&>div]:bg-red-500" : status === "warning" ? "[&>div]:bg-amber-500" : ""}`} />
                    <p className="text-xs text-muted-foreground mt-1">{pct}% remaining of original batch</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Reserved</p>
                      <p className="font-medium text-foreground">{v.reserved || 0}</p>
                    </div>
                    <div className="p-2 rounded bg-muted/50">
                      <p className="text-muted-foreground">Used</p>
                      <p className="font-medium text-foreground">{v.used || 0}</p>
                    </div>
                  </div>
                  {v.expiry && (
                    <p className="text-xs text-muted-foreground">Expiry: <span className={`font-medium ${status === "expired" ? "text-red-500" : "text-foreground"}`}>{v.expiry}</span></p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => { setEditVaccine(v); setAddQty(0); }}
                    data-testid={`button-edit-${v.id}`}
                  >
                    <Edit2 className="h-3 w-3 mr-1" /> Update Stock
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Batch Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold">Batch Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vaccine</TableHead>
                <TableHead>Batch No.</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>FIFO Order</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...vaccines].sort((a, b) => (a.expiry || "").localeCompare(b.expiry || "")).map((v, i) => {
                const status = getStatus(v);
                return (
                  <TableRow key={v.id} data-testid={`batch-row-${v.id}`}>
                    <TableCell className="font-medium text-sm">{v.name}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{v.batch || "—"}</TableCell>
                    <TableCell className="text-sm">{v.stock}</TableCell>
                    <TableCell className="text-sm">{v.expiry || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${status === "expired" ? "text-red-500 border-red-300" : status === "warning" ? "text-amber-500 border-amber-300" : "text-emerald-500 border-emerald-300"}`}>
                        {status === "expired" ? "Expired" : status === "warning" ? "Expiring Soon" : "Valid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">#{i + 1}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Vaccine Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Vaccine Stock</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            {[
              { id: "vname", label: "Vaccine Name", key: "name", type: "text" },
              { id: "vstock", label: "Initial Stock (doses)", key: "stock", type: "number" },
              { id: "vbatch", label: "Batch Number", key: "batch", type: "text" },
              { id: "vexpiry", label: "Expiry Date", key: "expiry", type: "date" },
              { id: "vreserved", label: "Reserved Doses", key: "reserved", type: "number" },
            ].map(f => (
              <div key={f.id}>
                <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
                <Input
                  id={f.id}
                  type={f.type}
                  value={(form as Record<string, string | number>)[f.key] as string}
                  onChange={e => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })}
                  data-testid={`input-${f.id}`}
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleSaveNew} disabled={!form.name} data-testid="button-save-vaccine">Save Vaccine</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Stock Dialog */}
      <Dialog open={!!editVaccine} onOpenChange={() => setEditVaccine(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Stock — {editVaccine?.name}</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">Current stock: <span className="font-semibold text-foreground">{editVaccine?.stock} doses</span></p>
            <div>
              <Label className="text-xs">Adjustment (use negative to reduce)</Label>
              <Input
                type="number"
                value={addQty}
                onChange={e => setAddQty(Number(e.target.value))}
                data-testid="input-stock-adjustment"
              />
            </div>
            {addQty !== 0 && (
              <div className="p-2 rounded-lg bg-muted/50 text-sm">
                New total: <span className="font-semibold text-foreground">{(editVaccine?.stock || 0) + addQty} doses</span>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditVaccine(null)}>Cancel</Button>
              <Button onClick={handleUpdateStock} data-testid="button-save-stock">Update Stock</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
