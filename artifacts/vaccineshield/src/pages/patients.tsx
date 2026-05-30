import { useState } from "react";
import { store, Patient, VaccinationRecord } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, User, Syringe, Calendar, Printer, CheckCircle2, ChevronRight, X } from "lucide-react";

const DISTRICTS = ["Central", "North", "South", "East", "West"];
const UNION_COUNCILS = ["UC-1", "UC-2", "UC-3", "UC-4", "UC-5"];

export default function Patients() {
  const [patients, setPatients] = useState(store.getPatients());
  const [vaccines] = useState(store.getVaccines());
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showVaccinate, setShowVaccinate] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState("");
  const [form, setForm] = useState({
    name: "", fatherName: "", motherName: "", guardianContact: "",
    dob: "", gender: "Male", address: "", district: "Central", unionCouncil: "UC-1"
  });

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.guardianContact.includes(search) ||
    p.district.toLowerCase().includes(search.toLowerCase())
  );

  const patientRecords = (patientId: string) =>
    store.getVaccinationRecords().filter(r => r.patientId === patientId);

  const handleRegister = () => {
    const newPatient: Patient = {
      ...form,
      id: `p${Date.now()}`,
      gender: form.gender as Patient["gender"],
      registeredAt: new Date().toISOString()
    };
    store.savePatient(newPatient);
    store.addAuditEntry({ userId: store.getCurrentUser()?.id || "", action: "REGISTER_PATIENT", details: `Registered patient ${newPatient.name}` });
    setPatients(store.getPatients());
    setShowRegister(false);
    setForm({ name: "", fatherName: "", motherName: "", guardianContact: "", dob: "", gender: "Male", address: "", district: "Central", unionCouncil: "UC-1" });
  };

  const handleVaccinate = () => {
    if (!selectedPatient || !selectedVaccine) return;
    const user = store.getCurrentUser();
    const vaccine = vaccines.find(v => v.id === selectedVaccine);
    if (!vaccine) return;
    const record: VaccinationRecord = {
      id: `r${Date.now()}`,
      patientId: selectedPatient.id,
      vaccineId: selectedVaccine,
      date: new Date().toISOString().split("T")[0],
      administeredBy: user?.name || "Unknown",
      nextAppointment: new Date(Date.now() + 1000 * 60 * 60 * 24 * 28).toISOString().split("T")[0]
    };
    store.saveVaccinationRecord(record);
    store.updateVaccineStock(selectedVaccine, -1);
    store.addAuditEntry({ userId: user?.id || "", action: "VACCINATE", details: `${vaccine.name} given to ${selectedPatient.name}` });
    setShowVaccinate(false);
    setSelectedVaccine("");
  };

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Patient Intake</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Register children and manage vaccinations</p>
        </div>
        <Button onClick={() => setShowRegister(true)} data-testid="button-register-patient">
          <Plus className="h-4 w-4 mr-2" /> Register Child
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Patient List */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patients..."
              className="pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
              data-testid="input-search-patient"
            />
          </div>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No patients found</p>
              </div>
            ) : (
              filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${selectedPatient?.id === p.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/50"}`}
                  data-testid={`patient-card-${p.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.guardianContact} · {p.district}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Patient Profile */}
        <div className="lg:col-span-3">
          {!selectedPatient ? (
            <Card className="h-full flex items-center justify-center min-h-[300px]">
              <CardContent className="text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="font-medium">Select a patient</p>
                <p className="text-sm mt-1">Choose a patient from the list to view their profile</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4" id="print-section">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                        {selectedPatient.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{selectedPatient.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{selectedPatient.gender}</Badge>
                          <Badge variant="outline" className="text-xs">{selectedPatient.district}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePrint} data-testid="button-print">
                        <Printer className="h-4 w-4 mr-1" /> Print Slip
                      </Button>
                      <Button size="sm" onClick={() => setShowVaccinate(true)} data-testid="button-vaccinate">
                        <Syringe className="h-4 w-4 mr-1" /> Vaccinate
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["Father", selectedPatient.fatherName], ["Mother", selectedPatient.motherName],
                      ["Contact", selectedPatient.guardianContact], ["DOB", selectedPatient.dob],
                      ["Address", selectedPatient.address], ["Union Council", selectedPatient.unionCouncil],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="font-medium text-foreground">{value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Syringe className="h-4 w-4" /> Vaccination History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patientRecords(selectedPatient.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No vaccinations recorded yet</p>
                  ) : (
                    <div className="space-y-3">
                      {patientRecords(selectedPatient.id).map(r => {
                        const vaccine = vaccines.find(v => v.id === r.vaccineId);
                        return (
                          <div key={r.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/40">
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{vaccine?.name || "Unknown"}</p>
                              <p className="text-xs text-muted-foreground">{r.date} · By {r.administeredBy}</p>
                            </div>
                            {r.nextAppointment && (
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Next</p>
                                <p className="text-xs font-medium text-foreground">{r.nextAppointment}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Register Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Child</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {[
              { id: "name", label: "Child Name", key: "name" },
              { id: "fatherName", label: "Father Name", key: "fatherName" },
              { id: "motherName", label: "Mother Name", key: "motherName" },
              { id: "guardianContact", label: "Guardian Contact", key: "guardianContact" },
              { id: "dob", label: "Date of Birth", key: "dob", type: "date" },
              { id: "address", label: "Address", key: "address" },
            ].map(f => (
              <div key={f.id} className={f.id === "address" ? "col-span-2" : ""}>
                <Label htmlFor={f.id} className="text-xs">{f.label}</Label>
                <Input
                  id={f.id}
                  type={f.type || "text"}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  data-testid={`input-${f.id}`}
                />
              </div>
            ))}
            <div>
              <Label className="text-xs">Gender</Label>
              <Select value={form.gender} onValueChange={v => setForm({ ...form, gender: v })}>
                <SelectTrigger data-testid="select-gender"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">District</Label>
              <Select value={form.district} onValueChange={v => setForm({ ...form, district: v })}>
                <SelectTrigger data-testid="select-district"><SelectValue /></SelectTrigger>
                <SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Union Council</Label>
              <Select value={form.unionCouncil} onValueChange={v => setForm({ ...form, unionCouncil: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{UNION_COUNCILS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowRegister(false)}>Cancel</Button>
            <Button onClick={handleRegister} data-testid="button-submit-register">Register Child</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Vaccinate Dialog */}
      <Dialog open={showVaccinate} onOpenChange={setShowVaccinate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Administer Vaccine — {selectedPatient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs">Select Vaccine</Label>
              <Select value={selectedVaccine} onValueChange={setSelectedVaccine}>
                <SelectTrigger data-testid="select-vaccine"><SelectValue placeholder="Choose vaccine..." /></SelectTrigger>
                <SelectContent>
                  {vaccines.filter(v => v.stock > 0).map(v => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} ({v.stock} doses)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedVaccine && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium text-foreground">Batch: {vaccines.find(v => v.id === selectedVaccine)?.batch}</p>
                <p className="text-muted-foreground">Expiry: {vaccines.find(v => v.id === selectedVaccine)?.expiry}</p>
                <p className="text-muted-foreground mt-1">Next appointment auto-scheduled for 28 days</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowVaccinate(false)}>Cancel</Button>
              <Button onClick={handleVaccinate} disabled={!selectedVaccine} data-testid="button-confirm-vaccinate">
                Confirm Vaccination
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
