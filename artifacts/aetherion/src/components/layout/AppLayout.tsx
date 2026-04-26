import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { useHealthCheck } from "@workspace/api-client-react";
import { Activity } from "lucide-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const { data: health } = useHealthCheck();

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <div className="scanline" />
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 relative z-10 bg-grid-pattern">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              COMMAND CENTER
            </h1>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border">
              <Activity className={`w-4 h-4 ${health ? "text-emerald-400 animate-pulse" : "text-amber-400"}`} />
              <span className={health ? "text-emerald-400" : "text-amber-400"}>
                {health ? "SYSTEM_NOMINAL" : "CONNECTING..."}
              </span>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
