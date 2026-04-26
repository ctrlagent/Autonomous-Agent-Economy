import { useState } from "react";
import { useListTemplates, useCreateStation } from "@workspace/api-client-react";
import { Search, Download, Star, Users, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const CATEGORIES = ["ALL", "CRYPTO", "ECOMMERCE", "CONTENT", "SAAS"];

export default function Market() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const { data: templates } = useListTemplates();
  const createStation = useCreateStation();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const [creatingTemplateId, setCreatingTemplateId] = useState<number | null>(null);
  const [stationName, setStationName] = useState("");

  const filteredTemplates = templates?.filter(t => {
    const matchesCategory = filter === "ALL" || t.category.toUpperCase() === filter;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const handleCreate = () => {
    if (!creatingTemplateId || !stationName.trim()) return;
    
    createStation.mutate({
      data: { name: stationName, templateId: creatingTemplateId }
    }, {
      onSuccess: () => {
        toast({ title: "Station Launched", description: "Your new station is now operational." });
        setLocation("/");
      },
      onError: () => {
        toast({ title: "Error", description: "Failed to launch station.", variant: "destructive" });
      }
    });
  };

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 flex flex-col h-full relative">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight uppercase">STATION MARKET</h1>
        <p className="text-muted-foreground mt-2 font-mono">Deploy pre-configured organizational structures.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search templates..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-border rounded-lg pl-10 pr-4 py-2 text-sm font-mono text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={cn(
                "px-4 py-2 text-xs font-mono rounded-lg transition-all border whitespace-nowrap",
                filter === c 
                  ? "bg-primary/10 text-primary border-primary/50" 
                  : "bg-black/30 text-muted-foreground border-transparent hover:bg-white/5 hover:text-white"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 min-h-0 pb-10">
        {filteredTemplates.map(template => (
          <div key={template.id} className="flex flex-col md:flex-row bg-card/40 backdrop-blur border border-border rounded-xl p-6 gap-6 hover:border-white/20 transition-colors">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-mono px-2 py-1 bg-white/10 rounded uppercase text-muted-foreground">{template.category}</span>
                <span className="text-xs text-amber-400 flex items-center gap-1"><Star className="w-3 h-3 fill-current" /> {template.rating}</span>
              </div>
              <h2 className="text-xl font-bold mb-2">{template.name}</h2>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </div>
            
            <div className="flex items-center gap-6 border-y md:border-y-0 md:border-x border-white/10 py-4 md:py-0 md:px-6 text-sm font-mono">
              <div className="flex flex-col items-center gap-1">
                <Users className="w-5 h-5 text-cyan-400" />
                <span>{template.agentCount} AGENTS</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <LayoutGrid className="w-5 h-5 text-violet-400" />
                <span>{template.roomCount} ROOMS</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Download className="w-5 h-5 text-emerald-400" />
                <span>{template.usageCount} USED</span>
              </div>
            </div>

            <div className="flex items-center justify-end md:w-48">
              <button 
                onClick={() => setCreatingTemplateId(template.id)}
                className="w-full md:w-auto px-6 py-3 bg-white text-black font-bold font-mono text-sm rounded-lg hover:bg-white/90 transition-colors"
              >
                USE TEMPLATE
              </button>
            </div>
          </div>
        ))}
      </div>

      {creatingTemplateId && (
        <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-2 uppercase">Deploy Station</h3>
            <p className="text-sm text-muted-foreground mb-6">Enter a designation for your new station.</p>
            
            <div className="mb-6">
              <label className="block text-xs font-mono text-muted-foreground mb-2">STATION DESIGNATION</label>
              <input 
                type="text" 
                value={stationName}
                onChange={e => setStationName(e.target.value)}
                autoFocus
                placeholder="e.g. ALPHA PRIME"
                className="w-full bg-black/40 border border-border rounded-lg px-4 py-3 font-mono text-white placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => { setCreatingTemplateId(null); setStationName(""); }}
                className="flex-1 px-4 py-2 border border-white/10 hover:bg-white/5 rounded-lg text-sm font-mono font-bold transition-colors"
              >
                CANCEL
              </button>
              <button 
                onClick={handleCreate}
                disabled={!stationName.trim() || createStation.isPending}
                className="flex-1 px-4 py-2 bg-primary text-black hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-mono font-bold transition-colors"
              >
                {createStation.isPending ? "DEPLOYING..." : "DEPLOY"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
