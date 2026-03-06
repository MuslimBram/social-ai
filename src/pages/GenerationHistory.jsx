import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Copy, Save, Trash2, Search, History, ImagePlus, Type } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const platformEmoji = { facebook: "📘", instagram: "📸", linkedin: "💼", twitter: "🐦" };
const platformColors = {
  facebook: "bg-blue-50 text-blue-700 border-blue-200",
  instagram: "bg-pink-50 text-pink-700 border-pink-200",
  linkedin: "bg-sky-50 text-sky-700 border-sky-200",
  twitter: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function GenerationHistory() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: history = [], isLoading } = useQuery({
    queryKey: ["gen-history"],
    queryFn: () => base44.entities.GenerationHistory.list("-created_date", 100),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GenerationHistory.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["gen-history"] }); toast.success("Deleted"); },
  });

  const saveAsPost = async (item) => {
    let parsed = {};
    try { parsed = JSON.parse(item.result); } catch { parsed = { post_text: item.result }; }

    await base44.entities.Post.create({
      title: `AI Post – ${format(new Date(item.created_date), "MMM d")}`,
      content: parsed.post_text || item.result,
      hashtags: parsed.hashtags?.join ? parsed.hashtags.map(h => `#${h}`).join(" ") : "",
      caption: parsed.caption || "",
      platform: item.platform || "instagram",
      tone: item.tone || "professional",
      status: "draft",
      topic: item.prompt,
    });
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Saved as draft post!");
  };

  const filtered = history.filter(h => {
    const matchTab = tab === "all" || h.type === tab;
    const matchSearch = !search || h.prompt?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const copyContent = (item) => {
    let text = item.result;
    try { const p = JSON.parse(item.result); text = p.post_text || item.result; } catch {}
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const parseResult = (item) => {
    if (item.type === "image") return null;
    try { return JSON.parse(item.result); } catch { return { post_text: item.result }; }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Generation History</h1>
        <p className="text-gray-500 mt-1">All your AI-generated content in one place.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="bg-gray-100">
            <TabsTrigger value="all">All <span className="ml-1 text-[10px] bg-white text-gray-600 px-1.5 py-0.5 rounded-full">{history.length}</span></TabsTrigger>
            <TabsTrigger value="text" className="gap-1.5"><Type className="w-3.5 h-3.5" />Text</TabsTrigger>
            <TabsTrigger value="image" className="gap-1.5"><ImagePlus className="w-3.5 h-3.5" />Images</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search prompts..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-36 bg-white rounded-2xl shadow-sm animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <History className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-500">No generation history yet.</p>
            <p className="text-sm text-gray-400 mt-1">Use the AI Generator or Image Creator to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(item => {
            const parsed = parseResult(item);
            return (
              <Card key={item.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {item.type === "image" && item.result?.startsWith("http") ? (
                      <img src={item.result} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                    ) : (
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === "image" ? "bg-violet-50" : "bg-indigo-50"}`}>
                        {item.type === "image" ? <ImagePlus className="w-5 h-5 text-violet-500" /> : <Type className="w-5 h-5 text-indigo-500" />}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">"{item.prompt}"</p>
                        <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
                          {format(new Date(item.created_date), "MMM d, h:mm a")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        {item.platform && (
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${platformColors[item.platform]}`}>
                            {platformEmoji[item.platform]} {item.platform}
                          </Badge>
                        )}
                        {item.tone && <Badge variant="outline" className="text-[10px] px-1.5 py-0">{item.tone}</Badge>}
                        <Badge className={`text-[10px] px-1.5 py-0 border-0 ${item.type === "image" ? "bg-violet-100 text-violet-700" : "bg-indigo-100 text-indigo-700"}`}>
                          {item.type}
                        </Badge>
                      </div>
                      {parsed && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 line-clamp-2">
                          {parsed.post_text}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t">
                    {item.type === "text" && (
                      <>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => copyContent(item)}>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                        </Button>
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => saveAsPost(item)}>
                          <Save className="w-3.5 h-3.5 mr-1" /> Save as Post
                        </Button>
                      </>
                    )}
                    {item.type === "image" && item.result?.startsWith("http") && (
                      <Button size="sm" variant="outline" className="text-xs" asChild>
                        <a href={item.result} target="_blank" rel="noopener noreferrer">
                          <ImagePlus className="w-3.5 h-3.5 mr-1" /> View Full
                        </a>
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-xs text-gray-400 ml-auto" onClick={() => deleteMutation.mutate(item.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}