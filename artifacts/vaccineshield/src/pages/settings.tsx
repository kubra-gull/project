import { useState } from "react";
import { useLocation } from "wouter";
import { store, User } from "@/lib/store";
import { useTheme } from "@/hooks/use-theme";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon, Bell, Globe, Moon, Sun, LogOut, Save, Shield, MapPin } from "lucide-react";

const DISTRICTS = ["Central", "North", "South", "East", "West"];

export default function Settings() {
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const user = store.getCurrentUser();
  const [profile, setProfile] = useState({ name: user?.name || "", district: user?.district || "Central" });
  const [saved, setSaved] = useState(false);
  const [notifications, setNotifications] = useState({
    smsReminders: true, emailAlerts: true, coldChainAlerts: true, stockAlerts: true,
  });

  const handleSaveProfile = () => {
    if (user) {
      const updated: User = { ...user, name: profile.name, district: profile.district };
      store.setCurrentUser(updated);
      // Also update in the users list
      const users = store.getUsers();
      const idx = users.findIndex(u => u.id === user.id);
      if (idx >= 0) {
        users[idx] = updated;
        localStorage.setItem("vs_users", JSON.stringify(users));
      }
      store.addAuditEntry({ userId: user.id, action: "UPDATE_PROFILE", details: "Profile settings updated" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleLogout = () => {
    if (user) store.addAuditEntry({ userId: user.id, action: "LOGOUT", details: "User logged out from settings" });
    store.setCurrentUser(null);
    setLocation("/login");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your account and application preferences</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <UserIcon className="h-4 w-4" /> Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl shrink-0">
              {user?.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{user?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />{user?.role}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <MapPin className="h-3 w-3 mr-1" />{user?.district}
                </Badge>
              </div>
            </div>
          </div>
          <Separator />
          <div className="space-y-3">
            <div>
              <Label htmlFor="profile-name" className="text-xs">Display Name</Label>
              <Input
                id="profile-name"
                value={profile.name}
                onChange={e => setProfile({ ...profile, name: e.target.value })}
                data-testid="input-profile-name"
              />
            </div>
            <div>
              <Label className="text-xs">Role</Label>
              <Input value={user?.role || ""} disabled className="bg-muted/50" />
            </div>
            <div>
              <Label className="text-xs">District</Label>
              <Select value={profile.district} onValueChange={v => setProfile({ ...profile, district: v })}>
                <SelectTrigger data-testid="select-district-settings"><SelectValue /></SelectTrigger>
                <SelectContent>{DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleSaveProfile} data-testid="button-save-profile">
            <Save className="h-4 w-4 mr-2" />
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
            <div>
              <p className="text-sm font-medium text-foreground">Dark Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark interface</p>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={checked => setTheme(checked ? "dark" : "light")}
              data-testid="switch-dark-mode"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "smsReminders", label: "SMS Vaccination Reminders", desc: "Send reminders to guardians for upcoming vaccinations" },
            { key: "emailAlerts", label: "Email Alerts", desc: "Receive daily reports via email" },
            { key: "coldChainAlerts", label: "Cold Chain Alerts", desc: "Immediate alerts when temperature thresholds are exceeded" },
            { key: "stockAlerts", label: "Low Stock Alerts", desc: "Notify when vaccine stock falls below 100 doses" },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <div>
                <p className="text-sm font-medium text-foreground">{n.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
              </div>
              <Switch
                checked={(notifications as Record<string, boolean>)[n.key]}
                onCheckedChange={checked => setNotifications({ ...notifications, [n.key]: checked })}
                data-testid={`switch-${n.key}`}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* District */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Globe className="h-4 w-4" /> System Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Version</span><span className="font-medium text-foreground">VaccineShield Pro 2.0</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Data Storage</span><span className="font-medium text-foreground">Browser localStorage</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Offline Mode</span><span className="text-emerald-500 font-medium">Active</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground">Session</span>
            <span className="font-medium text-foreground">{user?.username}</span>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="border-destructive/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Sign Out</p>
            <p className="text-xs text-muted-foreground mt-0.5">Log out of your VaccineShield Pro account</p>
          </div>
          <Button variant="destructive" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" /> Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
