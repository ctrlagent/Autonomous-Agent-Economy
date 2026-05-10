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

const queryClient = new QueryClient();

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/crew" component={Crew} />
        <Route path="/missions" component={Missions} />
        <Route path="/timeline" component={Timeline} />
        <Route path="/ship-comms" component={ShipComms} />
        <Route path="/templates" component={Market} />
        <Route path="/stations/:id" component={Dashboard} />
        <Route path="/rooms/:id" component={RoomDetail} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
