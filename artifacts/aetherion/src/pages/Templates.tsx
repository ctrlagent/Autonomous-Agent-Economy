import { useState } from "react";
import { 
  useListTemplates, 
  useCreateTemplate,
  getListTemplatesQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Box, Download, Star, Users, Layout, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Templates() {
  const [category, setCategory] = useState<string>("all");
  const { data: templates } = useListTemplates(
    category !== "all" ? { category: category as any } : undefined
  );
  
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Template Marketplace</h1>
          <p className="text-muted-foreground">Discover and deploy pre-configured AI business networks.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="crypto">Crypto & Web3</SelectItem>
              <SelectItem value="ecommerce">E-Commerce</SelectItem>
              <SelectItem value="content">Content & Media</SelectItem>
              <SelectItem value="saas">SaaS Builders</SelectItem>
            </SelectContent>
          </Select>
          
          <CreateTemplateDialog open={open} setOpen={setOpen} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={template.id}
            className="flex flex-col"
          >
            <Card className="flex-1 flex flex-col border-border/50 bg-card/50 backdrop-blur hover:border-primary/50 transition-colors group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 capitalize">
                    {template.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                    <Star className="w-3 h-3 fill-current" />
                    {template.rating}
                  </div>
                </div>
                <CardTitle className="text-xl">{template.name}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                  {template.description}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                  <div className="flex items-center gap-2 text-muted-foreground bg-background/50 p-2 rounded border border-border/50">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{template.agentCount} Agents</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground bg-background/50 p-2 rounded border border-border/50">
                    <Layout className="w-4 h-4 text-secondary" />
                    <span>{template.roomCount} Rooms</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-4 border-t border-border/50 flex justify-between items-center bg-background/30">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Download className="w-3 h-3" />
                  {template.usageCount} deployments
                </div>
                <Button variant="secondary" size="sm" className="gap-2">
                  <Box className="w-4 h-4" />
                  Deploy
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function CreateTemplateDialog({ open, setOpen }: { open: boolean, setOpen: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("crypto");
  
  const createTemplate = useCreateTemplate();
  const queryClient = useQueryClient();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !category) return;

    createTemplate.mutate({
      data: {
        name,
        description,
        category: category as any,
        isPublished: true
      }
    }, {
      onSuccess: () => {
        setOpen(false);
        setName("");
        setDescription("");
        setCategory("crypto");
        queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Build Template
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card">
        <DialogHeader>
          <DialogTitle>Build New Template</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Template Name</Label>
            <Input 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea 
              id="desc" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crypto">Crypto</SelectItem>
                <SelectItem value="ecommerce">E-Commerce</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="saas">SaaS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={!name || !description || createTemplate.isPending}
              className="w-full"
            >
              {createTemplate.isPending ? "Creating..." : "Save Template"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
