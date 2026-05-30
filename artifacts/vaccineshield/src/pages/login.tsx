import { useState } from "react";
import { useLocation } from "wouter";
import { store, User } from "@/lib/store";
import { ShieldCheck, Eye, EyeOff, UserCog, Stethoscope, ClipboardList, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ROLES = [
  { label: "Health Worker", icon: UserCog, username: "worker", password: "pass123" },
  { label: "Nurse", icon: Stethoscope, username: "nurse", password: "pass123" },
  { label: "Supervisor", icon: ClipboardList, username: "supervisor", password: "pass123" },
  { label: "Administrator", icon: Shield, username: "admin", password: "pass123" },
];

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleRoleSelect = (role: typeof ROLES[0]) => {
    setSelectedRole(role.label);
    setUsername(role.username);
    setPassword(role.password);
    setError("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setTimeout(() => {
      const users = store.getUsers();
      const user = users.find((u) => u.username === username);
      if (!user || password !== "pass123") {
        setError("Invalid username or password.");
        setLoading(false);
        return;
      }
      store.setCurrentUser(user as User);
      store.addAuditEntry({ userId: user.id, action: "LOGIN", details: `${user.name} logged in as ${user.role}` });
      setLocation("/dashboard");
    }, 600);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="absolute rounded-full bg-primary" style={{
              width: `${Math.random() * 200 + 50}px`,
              height: `${Math.random() * 200 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              transform: "translate(-50%, -50%)"
            }} />
          ))}
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
              <ShieldCheck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-sidebar-foreground">VaccineShield Pro</h1>
              <p className="text-xs text-sidebar-foreground/60">Smart Immunization Management</p>
            </div>
          </div>
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-sidebar-foreground leading-tight">
              Protecting<br />Children's<br />Health
            </h2>
            <p className="text-sidebar-foreground/70 text-lg leading-relaxed max-w-sm">
              A complete enterprise platform for immunization tracking, vaccine inventory management, and disease prevention.
            </p>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {[
            { label: "Children Protected", value: "2.4M+" },
            { label: "Vaccines Tracked", value: "12" },
            { label: "Districts Covered", value: "48" },
            { label: "Coverage Rate", value: "94%" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
              <div className="text-2xl font-bold text-primary">{stat.value}</div>
              <div className="text-xs text-sidebar-foreground/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">VaccineShield Pro</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-1">Sign in to your account to continue</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.label}
                  type="button"
                  onClick={() => handleRoleSelect(role)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium ${
                    selectedRole === role.label
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                  data-testid={`role-${role.label.toLowerCase().replace(" ", "-")}`}
                >
                  <Icon className="h-5 w-5" />
                  {role.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                data-testid="input-username"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(""); }}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  data-testid="input-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  data-testid="toggle-password"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              data-testid="button-login"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <Card className="mt-6 bg-muted/50">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Demo Credentials</p>
              <div className="space-y-1">
                {ROLES.map((r) => (
                  <div key={r.label} className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-mono text-foreground">{r.username} / pass123</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
