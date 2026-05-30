import { useState } from "react";
import { store, Notification } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageSquare, Mail, Phone, Send, CheckCircle2, Clock, X } from "lucide-react";

const TEMPLATES = [
  { id: "reminder", label: "Vaccination Reminder", body: "Dear {name}, your child is due for {vaccine} vaccination on {date}. Please visit your nearest health center. — VaccineShield Pro" },
  { id: "missed", label: "Missed Dose Reminder", body: "Dear {name}, your child missed their {vaccine} dose on {date}. Please schedule a catch-up visit immediately. — VaccineShield Pro" },
  { id: "followup", label: "Follow-Up Appointment", body: "Dear {name}, this is a reminder for your follow-up appointment on {date} for {vaccine}. Contact us at 0800-VACCINE. — VaccineShield Pro" },
  { id: "campaign", label: "Campaign Notification", body: "Attention! National Immunization Campaign in {district} from {date}. All children under 5 must be vaccinated. — VaccineShield Pro" },
];

const STATUS_COLORS: Record<string, string> = {
  Delivered: "text-emerald-500 border-emerald-300",
  Pending: "text-amber-500 border-amber-300",
  Failed: "text-red-500 border-red-300",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState(store.getNotifications());
  const [channel, setChannel] = useState<"SMS" | "Email" | "WhatsApp">("SMS");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [recipient, setRecipient] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleTemplateSelect = (id: string) => {
    const t = TEMPLATES.find(t => t.id === id);
    if (t) setMessage(t.body);
    setSelectedTemplate(id);
  };

  const handleSend = () => {
    if (!recipient || !message) return;
    setSending(true);
    setTimeout(() => {
      const n: Notification = {
        id: `n${Date.now()}`,
        type: channel,
        recipient,
        message,
        status: Math.random() > 0.15 ? "Delivered" : "Failed",
        timestamp: new Date().toISOString(),
      };
      store.saveNotification(n);
      setNotifications(store.getNotifications());
      setSending(false);
      setRecipient("");
      setMessage("");
      setSelectedTemplate("");
    }, 1200);
  };

  const handleBulkSend = () => {
    const patients = store.getPatients().slice(0, 5);
    patients.forEach(p => {
      const n: Notification = {
        id: `n${Date.now()}-${p.id}`,
        type: channel,
        recipient: p.guardianContact,
        message: `Reminder: ${p.name} is due for vaccination. Please visit your nearest health center.`,
        status: Math.random() > 0.1 ? "Delivered" : "Pending",
        timestamp: new Date().toISOString(),
      };
      store.saveNotification(n);
    });
    setNotifications(store.getNotifications());
  };

  const counts = {
    Delivered: notifications.filter(n => n.status === "Delivered").length,
    Pending: notifications.filter(n => n.status === "Pending").length,
    Failed: notifications.filter(n => n.status === "Failed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Notification Center</h2>
          <p className="text-muted-foreground text-sm mt-0.5">SMS, Email and WhatsApp communication gateway</p>
        </div>
        <Button variant="outline" onClick={handleBulkSend} data-testid="button-bulk-send">
          <Send className="h-4 w-4 mr-2" /> Bulk Send Reminders
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Delivered", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Pending", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "Failed", icon: X, color: "text-red-500", bg: "bg-red-500/10" },
        ].map(s => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg ${s.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{counts[s.label as keyof typeof counts]}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compose */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Compose Message</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Channel Tabs */}
            <Tabs value={channel} onValueChange={v => setChannel(v as typeof channel)}>
              <TabsList className="w-full">
                <TabsTrigger value="SMS" className="flex-1 text-xs" data-testid="tab-sms"><Phone className="h-3.5 w-3.5 mr-1" />SMS</TabsTrigger>
                <TabsTrigger value="Email" className="flex-1 text-xs" data-testid="tab-email"><Mail className="h-3.5 w-3.5 mr-1" />Email</TabsTrigger>
                <TabsTrigger value="WhatsApp" className="flex-1 text-xs" data-testid="tab-whatsapp"><MessageSquare className="h-3.5 w-3.5 mr-1" />WhatsApp</TabsTrigger>
              </TabsList>
            </Tabs>

            <div>
              <Label className="text-xs">Template</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger data-testid="select-template"><SelectValue placeholder="Choose a template..." /></SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map(t => <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Recipient ({channel === "Email" ? "email" : "phone"})</Label>
              <Input
                placeholder={channel === "Email" ? "guardian@email.com" : "+1 555-0000"}
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                data-testid="input-recipient"
              />
            </div>
            <div>
              <Label className="text-xs">Message</Label>
              <Textarea
                placeholder="Type your message or choose a template above..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                data-testid="textarea-message"
              />
              <p className="text-xs text-muted-foreground mt-1">{message.length} characters</p>
            </div>

            {/* Preview */}
            {message && (
              <div className="p-3 rounded-lg bg-muted/50 border">
                <p className="text-xs font-semibold text-muted-foreground mb-1">PREVIEW</p>
                <p className="text-sm text-foreground">{message}</p>
              </div>
            )}

            <Button
              className="w-full"
              onClick={handleSend}
              disabled={!recipient || !message || sending}
              data-testid="button-send"
            >
              <Send className="h-4 w-4 mr-2" />
              {sending ? "Sending..." : `Send via ${channel}`}
            </Button>
          </CardContent>
        </Card>

        {/* Send Queue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Send Queue & History</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Send className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No messages sent yet</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[...notifications].reverse().map(n => (
                  <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border" data-testid={`notification-${n.id}`}>
                    <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${n.type === "SMS" ? "bg-blue-500/10" : n.type === "Email" ? "bg-purple-500/10" : "bg-emerald-500/10"}`}>
                      {n.type === "Email" ? <Mail className="h-3.5 w-3.5 text-purple-500" /> : n.type === "WhatsApp" ? <MessageSquare className="h-3.5 w-3.5 text-emerald-500" /> : <Phone className="h-3.5 w-3.5 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{n.recipient}</p>
                        <Badge variant="outline" className={`text-xs shrink-0 ${STATUS_COLORS[n.status]}`}>{n.status}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
