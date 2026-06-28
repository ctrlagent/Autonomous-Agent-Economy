import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Crew from "@/pages/Crew";
import Missions from "@/pages/Missions";
import Kanban from "@/pages/Kanban";
import Timeline from "@/pages/Timeline";
import Market from "@/pages/Market";
import ShipComms from "@/pages/ShipComms";
import RoomDetail from "@/pages/RoomDetail";
import Marketing from "@/pages/Marketing";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Docs from "@/pages/Docs";
import Agents from "@/pages/Agents";
import Stations from "@/pages/Stations";
import Airlock from "@/pages/Airlock";
import BriefingRoom from "@/pages/BriefingRoom";
import { EVMWalletProvider } from "@/lib/WalletProvider";
import { WalletGate } from "@/components/WalletGate";
import { WalletHeaderSync } from "@/components/WalletHeaderSync";
import { Component, type ReactNode, type ErrorInfo } from "react";

class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: Error, info: ErrorInfo) { console.error("[CTRL] Render error:", err, info); }
  render() {
    if (this.state.hasError) return this.props.fallback ?? null;
    return this.props.children;
  }
}

function SafeWalletProvider({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary fallback={<>{children}</>}>
      <EVMWalletProvider>{children}</EVMWalletProvider>
    </ErrorBoundary>
  );
}

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <WalletGate>
      <AppShell>
        <Switch>
          <Route path="/app" component={Dashboard} />
          <Route path="/app/crew" component={Crew} />
          <Route path="/app/missions" component={Kanban} />
          <Route path="/app/kanban" component={Kanban} />
          <Route path="/app/missions-legacy" component={Missions} />
          <Route path="/app/timeline" component={Timeline} />
          <Route path="/app/templates" component={Market} />
          <Route path="/app/ship-comms" component={ShipComms} />
          <Route path="/app/settings" component={Settings} />
          <Route path="/app/profile" component={Profile} />
          <Route path="/app/agents" component={Agents} />
          <Route path="/app/stations" component={Stations} />
          <Route path="/app/stations/:id" component={Dashboard} />
          <Route path="/app/airlock" component={Airlock} />
          <Route path="/app/briefing" component={BriefingRoom} />
          <Route path="/app/rooms/:id" component={RoomDetail} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </WalletGate>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Marketing} />
      <Route path="/welcome" component={Marketing} />
      <Route path="/marketing" component={Marketing} />
      <Route path="/docs" component={Docs} />
      <Route component={AppRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SafeWalletProvider>
            <WalletHeaderSync />
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </SafeWalletProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
