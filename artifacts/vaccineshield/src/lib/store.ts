import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  role: z.enum(["Health Worker", "Nurse", "Supervisor", "Administrator"]),
  district: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const PatientSchema = z.object({
  id: z.string(),
  name: z.string(),
  fatherName: z.string(),
  motherName: z.string(),
  guardianContact: z.string(),
  dob: z.string(),
  gender: z.enum(["Male", "Female", "Other"]),
  address: z.string(),
  district: z.string(),
  unionCouncil: z.string(),
  registeredAt: z.string(),
});
export type Patient = z.infer<typeof PatientSchema>;

export const VaccineSchema = z.object({
  id: z.string(),
  name: z.string(),
  stock: z.number(),
  batch: z.string().optional(),
  expiry: z.string().optional(),
  reserved: z.number().default(0),
  used: z.number().default(0),
});
export type Vaccine = z.infer<typeof VaccineSchema>;

export const VaccinationRecordSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  vaccineId: z.string(),
  date: z.string(),
  administeredBy: z.string(),
  nextAppointment: z.string().optional(),
});
export type VaccinationRecord = z.infer<typeof VaccinationRecordSchema>;

export const ColdChainReadingSchema = z.object({
  id: z.string(),
  unitId: z.string(),
  temperature: z.number(),
  timestamp: z.string(),
  status: z.enum(["Safe", "Warning", "Critical"]),
});
export type ColdChainReading = z.infer<typeof ColdChainReadingSchema>;

export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(["SMS", "Email", "WhatsApp"]),
  recipient: z.string(),
  message: z.string(),
  status: z.enum(["Delivered", "Pending", "Failed"]),
  timestamp: z.string(),
});
export type Notification = z.infer<typeof NotificationSchema>;

export const FeedbackSchema = z.object({
  id: z.string(),
  workerName: z.string(),
  rating: z.number(),
  comment: z.string(),
  timestamp: z.string(),
});
export type Feedback = z.infer<typeof FeedbackSchema>;

export const ReconciliationSchema = z.object({
  id: z.string(),
  date: z.string(),
  submittedBy: z.string(),
  openingStock: z.number(),
  administered: z.number(),
  remaining: z.number(),
  physicalCount: z.number(),
  variance: z.number(),
  approved: z.boolean(),
});
export type Reconciliation = z.infer<typeof ReconciliationSchema>;

export const AuditLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  userId: z.string(),
  action: z.string(),
  details: z.string(),
});
export type AuditLog = z.infer<typeof AuditLogSchema>;

// Helpers
const getStorage = <T>(key: string, fallback: T[] = []): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : fallback;
};

const setStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Seeding Data
const seedData = () => {
  if (localStorage.getItem("vaccineshield_seeded")) return;

  const vaccines: Vaccine[] = [
    { id: "v1", name: "Polio (OPV)", stock: 450, batch: "BCG2024-A", expiry: "2025-12-31", reserved: 20, used: 150 },
    { id: "v2", name: "Measles (MCV1)", stock: 320, batch: "MSL-092", expiry: "2024-10-15", reserved: 10, used: 100 },
    { id: "v3", name: "BCG", stock: 280, batch: "BCG-881", expiry: "2026-01-20", reserved: 5, used: 200 },
    { id: "v4", name: "Pentavalent (DPT-HepB-Hib)", stock: 195, batch: "PNT-44", expiry: "2025-06-30", reserved: 15, used: 80 },
    { id: "v5", name: "Pneumococcal (PCV)", stock: 310, batch: "PCV-99", expiry: "2025-08-15", reserved: 25, used: 120 },
    { id: "v6", name: "Rotavirus (RVV)", stock: 85, batch: "RVV-12", expiry: "2024-05-10", reserved: 5, used: 40 },
    { id: "v7", name: "Typhoid", stock: 220, batch: "TYP-34", expiry: "2025-11-20", reserved: 10, used: 60 },
    { id: "v8", name: "Rubella (MR)", stock: 175, batch: "MR-76", expiry: "2026-03-15", reserved: 8, used: 90 },
  ];
  setStorage("vs_vaccines", vaccines);

  const patients: Patient[] = Array.from({ length: 25 }).map((_, i) => ({
    id: `p${i + 1}`,
    name: `Child ${i + 1}`,
    fatherName: `Father ${i + 1}`,
    motherName: `Mother ${i + 1}`,
    guardianContact: `+1 555-01${i.toString().padStart(2, '0')}`,
    dob: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 24 * 365).toISOString().split('T')[0],
    gender: i % 2 === 0 ? "Male" : "Female",
    address: `${100 + i} Main St`,
    district: "Central",
    unionCouncil: `UC-${(i % 5) + 1}`,
    registeredAt: new Date().toISOString(),
  }));
  setStorage("vs_patients", patients);

  const coldChain: ColdChainReading[] = Array.from({ length: 24 }).map((_, i) => ({
    id: `cc${i}`,
    unitId: `Frige-${(i % 3) + 1}`,
    temperature: 2 + Math.random() * 6, // 2-8 is safe
    timestamp: new Date(Date.now() - i * 1000 * 60 * 60).toISOString(),
    status: "Safe"
  }));
  setStorage("vs_cold_chain", coldChain);

  const users: User[] = [
    { id: "u1", username: "worker", name: "Sarah Jenkins", role: "Health Worker", district: "Central" },
    { id: "u2", username: "nurse", name: "Fatima Khan", role: "Nurse", district: "Central" },
    { id: "u3", username: "supervisor", name: "James Smith", role: "Supervisor", district: "Central" },
    { id: "u4", username: "admin", name: "Dr. Ahmed", role: "Administrator", district: "Central" },
  ];
  setStorage("vs_users", users);

  const feedback: Feedback[] = [
    { id: "f1", workerName: "Ali", rating: 5, comment: "App is very fast now.", timestamp: new Date().toISOString() },
    { id: "f2", workerName: "Ayesha", rating: 4, comment: "Needs better offline support.", timestamp: new Date().toISOString() },
  ];
  setStorage("vs_feedback", feedback);

  localStorage.setItem("vaccineshield_seeded", "true");
};

// API
export const store = {
  init: seedData,

  // Users / Auth
  getCurrentUser: (): User | null => {
    const data = localStorage.getItem("vs_current_user");
    return data ? JSON.parse(data) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem("vs_current_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("vs_current_user");
    }
  },
  getUsers: () => getStorage<User>("vs_users"),

  // Patients
  getPatients: () => getStorage<Patient>("vs_patients"),
  savePatient: (patient: Patient) => {
    const patients = store.getPatients();
    const existing = patients.findIndex(p => p.id === patient.id);
    if (existing >= 0) patients[existing] = patient;
    else patients.push(patient);
    setStorage("vs_patients", patients);
  },
  deletePatient: (id: string) => {
    setStorage("vs_patients", store.getPatients().filter(p => p.id !== id));
  },

  // Vaccines
  getVaccines: () => getStorage<Vaccine>("vs_vaccines"),
  saveVaccine: (vaccine: Vaccine) => {
    const vaccines = store.getVaccines();
    const existing = vaccines.findIndex(v => v.id === vaccine.id);
    if (existing >= 0) vaccines[existing] = vaccine;
    else vaccines.push(vaccine);
    setStorage("vs_vaccines", vaccines);
  },
  updateVaccineStock: (id: string, change: number) => {
    const vaccines = store.getVaccines();
    const v = vaccines.find(v => v.id === id);
    if (v) {
      v.stock += change;
      setStorage("vs_vaccines", vaccines);
    }
  },

  // Records
  getVaccinationRecords: () => getStorage<VaccinationRecord>("vs_records"),
  saveVaccinationRecord: (record: VaccinationRecord) => {
    const records = store.getVaccinationRecords();
    records.push(record);
    setStorage("vs_records", records);
  },

  // Cold Chain
  getColdChainReadings: () => getStorage<ColdChainReading>("vs_cold_chain"),
  saveColdChainReading: (reading: ColdChainReading) => {
    const readings = store.getColdChainReadings();
    readings.push(reading);
    setStorage("vs_cold_chain", readings);
  },

  // Notifications
  getNotifications: () => getStorage<Notification>("vs_notifications"),
  saveNotification: (notification: Notification) => {
    const notifs = store.getNotifications();
    notifs.push(notification);
    setStorage("vs_notifications", notifs);
  },

  // Feedback
  getFeedback: () => getStorage<Feedback>("vs_feedback"),
  saveFeedback: (feedback: Feedback) => {
    const fb = store.getFeedback();
    fb.push(feedback);
    setStorage("vs_feedback", fb);
  },

  // Reconciliation
  getReconciliations: () => getStorage<Reconciliation>("vs_reconciliations"),
  saveReconciliation: (rec: Reconciliation) => {
    const recs = store.getReconciliations();
    recs.push(rec);
    setStorage("vs_reconciliations", recs);
  },

  // Audit
  getAuditLog: () => getStorage<AuditLog>("vs_audit"),
  addAuditEntry: (entry: Omit<AuditLog, "id" | "timestamp">) => {
    const logs = store.getAuditLog();
    logs.push({
      ...entry,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    });
    setStorage("vs_audit", logs);
  }
};

store.init();
