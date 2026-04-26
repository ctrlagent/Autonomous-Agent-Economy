import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Home, Users, Target, Clock, Store, Settings } from "lucide-react";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: summary } = useGetDashboardSummary();

  const navItems = [
    { href: "/", label: "STATION", icon: Home },
    { href: "/crew", label: "CREW", icon: Users },
    { href: "/missions", label: "MISSIONS", icon: Target },
    { href: "/timeline", label: "TIMELINE", icon: Clock },
    { href: "/templates", label: "MARKET", icon: Store },
  ];

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-background text-foreground overflow-hidden">
      <div className="scanline" />
      
      {/* TOP BAR */}
      <header className="h-12 flex-shrink-0 flex items-center justify-between px-4 border-b border-border/50 bg-background/90 backdrop-blur-md z-20">
        <div className="flex items-center gap-2 font-mono font-bold tracking-wider text-primary">
          AETHERION
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-primary/20 rounded">
              <span className="text-muted-foreground">REV</span>
              <span className="text-emerald-400">$0</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-primary/20 rounded">
              <span className="text-muted-foreground">TASKS</span>
              <span className="text-blue-400">{summary?.tasksCompletedToday || 0}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-black/40 border border-primary/20 rounded">
              <span className="text-muted-foreground">AGENTS</span>
              <span className="text-cyan-400">{summary?.activeAgents || 0}/{summary?.totalAgents || 0}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 min-h-0 relative z-10 bg-grid-pattern overflow-hidden flex flex-col">
        {children}
      </main>

      {/* BOTTOM NAV */}
      <nav className="h-14 flex-shrink-0 flex border-t border-border/50 bg-background/95 backdrop-blur z-20">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn("bottom-nav-item group", isActive && "active")}>
              <Icon className="w-5 h-5 mb-1 group-hover:text-primary transition-colors" />
              <span className="text-[10px] font-mono tracking-wider">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
