import { Link, useLocation } from "wouter";
import { 
  Rocket, 
  LayoutDashboard, 
  Satellite, 
  Box, 
  Users, 
  Settings,
  Terminal,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Bridge", icon: LayoutDashboard },
  { href: "/stations", label: "Mission Control", icon: Satellite },
  { href: "/templates", label: "Marketplace", icon: Box },
  { href: "/agents", label: "Agent Roster", icon: Users },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 border-r border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border/50">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Rocket className="h-5 w-5" />
            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-primary/30" />
          </div>
          <span className="font-mono text-lg font-bold tracking-wider text-primary">AETHERION</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-md relative overflow-hidden transition-colors",
                  isActive 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full" />
                )}
                <Icon className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground">
          <Terminal className="h-4 w-4" />
          <span className="font-mono text-xs">SYS_ONLINE</span>
          <span className="relative flex h-2 w-2 ml-auto">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>
      </div>
    </div>
  );
}
