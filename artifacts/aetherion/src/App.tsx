import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppShell } from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import Crew from "@/pages/Crew";
import Missions from "@/pages/Missions";
import Timeline from "@/pages/Timeline";
import Market from "@/pages/Market";
import ShipComms from "@/pages/ShipComms";
import RoomDetail from "@/pages/RoomDetail";
import Marketing from "@/pages/Marketing";
import Settings from "@/pages/Settings";
import { SolanaWalletProvider } from "@/lib/WalletProvider";
import { WalletGate } from "@/components/WalletGate";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <WalletGate>
      <AppShell>
        <Switch>
          <Route path="/app" component={Dashboard} />
          <Route path="/app/crew" component={Crew} />
          <Route path="/app/missions" component={Missions} />
          <Route path="/app/timeline" component={Timeline} />
          <Route path="/app/templates" component={Market} />
          <Route path="/app/ship-comms" component={ShipComms} />
          <Route path="/app/settings" component={Settings} />
          <Route path="/app/stations/:id" component={Dashboard} />
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
      <Route component={AppRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SolanaWalletProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </SolanaWalletProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
