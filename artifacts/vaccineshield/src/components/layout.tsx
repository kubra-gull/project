import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { store } from "@/lib/store";
import { useTheme } from "@/hooks/use-theme";
import { 
  LayoutDashboard, Users, Box, ThermometerSnowflake, 
  ScanLine, Bell, FileText, ClipboardCheck, 
  MessageSquare, Settings, LogOut, Sun, Moon,
  ShieldCheck, Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();
  const user = store.getCurrentUser();

  if (!user && location !== "/login") {
    setLocation("/login");
    return null;
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/patients", label: "Patient Intake", icon: Users },
    { href: "/inventory", label: "Inventory", icon: Box },
    { href: "/cold-chain", label: "Cold Chain", icon: ThermometerSnowflake },
    { href: "/scanner", label: "Scanner", icon: ScanLine },
    { href: "/notifications", label: "Notifications", icon: Bell },
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/reconciliation", label: "End of Day", icon: ClipboardCheck },
    { href: "/feedback", label: "Feedback", icon: MessageSquare },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = () => {
    store.setCurrentUser(null);
    store.addAuditEntry({ userId: user?.id || "", action: "LOGOUT", details: "User logged out" });
    setLocation("/login");
  };

  const NavLinks = () => (
    <div className="flex flex-col gap-1 w-full h-full">
      <div className="flex items-center gap-2 px-4 py-6 mb-4">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <span className="text-xl font-bold text-sidebar-foreground">VaccineShield</span>
      </div>
      
      <div className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors ${
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}>
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 mt-auto border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 text-sidebar-foreground mb-4">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {user?.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.name}</span>
            <span className="text-xs text-sidebar-foreground/70">{user?.role}</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-bold text-foreground">VaccineShield</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r-sidebar-border">
              <NavLinks />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-sidebar border-r border-sidebar-border">
        <NavLinks />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Topbar */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 border-b bg-card">
          <h1 className="text-2xl font-semibold text-foreground capitalize">
            {location.replace("/", "").replace("-", " ") || "Dashboard"}
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
