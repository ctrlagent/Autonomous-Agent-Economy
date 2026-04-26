import { useState } from "react";
import { Link } from "wouter";
import { 
  useListStations, 
  useCreateStation,
  useListTemplates,
  getListStationsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Satellite, Activity, Users, CheckCircle2 } from "lucide-react";
import { STATION_STATUS_COLORS } from "@/lib/constants";
import { motion } from "framer-motion";

export default function Stations() {
  const { data: stations } = useListStations();
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground">Manage active space stations and monitor progress.</p>
        </div>
        <CreateStationDialog open={open} setOpen={setOpen} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stations?.map((station, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            key={station.id}
          >
            <Link href={`/stations/${station.id}`}>
              <Card className="border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors cursor-pointer group h-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Satellite className="w-5 h-5 text-primary" />
                        {station.name}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{station.templateName}</p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${STATION_STATUS_COLORS[station.status]}`}>
                      {station.status.toUpperCase()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mission Progress</span>
                      <span className="font-medium">{station.progress}%</span>
                    </div>
                    <Progress value={station.progress} className="h-1.5" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50">
                    <div className="flex flex-col items-center justify-center p-2 rounded bg-background/50 border border-border/50">
                      <Users className="w-4 h-4 text-primary mb-1" />
                      <span className="text-sm font-bold">{station.activeAgents}/{station.agentCount}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">Agents</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded bg-background/50 border border-border/50">
                      <Activity className="w-4 h-4 text-emerald-400 mb-1" />
                      <span className="text-sm font-bold">{station.roomCount}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">Rooms</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 rounded bg-background/50 border border-border/50">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mb-1" />
                      <span className="text-sm font-bold">{station.tasksCompleted}/{station.tasksTotal}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">Tasks</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CreateStationDialog({ open, setOpen }: { open: boolean, setOpen: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [templateId, setTemplateId] = useState<string>("");
  
  const { data: templates } = useListTemplates();
  const createStation = useCreateStation();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !templateId) return;

    createStation.mutate({
      data: {
        name,
        templateId: parseInt(templateId, 10)
      }
    }, {
      onSuccess: () => {
        setOpen(false);
        setName("");
        setTemplateId("");
        queryClient.invalidateQueries({ queryKey: getListStationsQueryKey() });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Deploy Station
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle>Deploy New Station</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Station Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. Alpha Base" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="template">Template</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select template..." />
              </SelectTrigger>
              <SelectContent>
                {templates?.map(t => (
                  <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={!name || !templateId || createStation.isPending}
              className="w-full"
            >
              {createStation.isPending ? "Deploying..." : "Launch Station"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
