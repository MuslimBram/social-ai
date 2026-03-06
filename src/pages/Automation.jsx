import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Zap, Plus, Play, Pause, Sparkles, CalendarDays, RefreshCw, Loader2, Clock, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const workflows = [
  {
    id: "weekly-content",
    name: "Weekly Content Generator",
    description: "Automatically generate and schedule a full week of posts every Monday morning.",
    icon: CalendarDays,
    color: "indigo",
    enabled: false,
    stats: "7 posts/week",
  },
  {
    id: "daily-quote",
    name: "Daily Inspiration Posts",
    description: "Post an inspirational quote every day at 8am to boost morning engagement.",
    icon: Sparkles,
    color: "amber",
    enabled: true,
    stats: "1 post/day",
  },
  {
    id: "product-promo",
    name: "Product Promotion Cycle",
    description: "Rotate through your top products and auto-generate promotional posts on a schedule.",
    icon: RefreshCw,
    color: "violet",
    enabled: false,
    stats: "3 posts/week",
  },
  {
    id: "engagement-boost",
    name: "Engagement Booster",
    description: "Automatically reply to comments and schedule engagement posts during peak hours.",
    icon: Zap,
    color: "emerald",
    enabled: true,
    stats: "2x/day",
  },
];

const colorMap = {
  indigo: { bg: "bg-indigo-50", text: "text-indigo-600", badge: "bg-indigo-100 text-indigo-700" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", badge: "bg-amber-100 text-amber-700" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", badge: "bg-violet-100 text-violet-700" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700" },
};

export default function Automation() {
  const [workflowStates, setWorkflowStates] = useState(
    Object.fromEntries(workflows.map(w => [w.id, w.enabled]))
  );
  const [showBulkGen, setShowBulkGen] = useState(false);
  const [bulkConfig, setBulkConfig] = useState({
    topic: "",
    platform: "instagram",
    tone: "professional",
    count: "5",
    days: "7",
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const queryClient = useQueryClient();

  const toggleWorkflow = (id) => {
    const newState = !workflowStates[id];
    setWorkflowStates(prev => ({ ...prev, [id]: newState }));
    toast.success(`Workflow ${newState ? "enabled" : "disabled"}`);
  };

  const handleBulkGenerate = async () => {
    if (!bulkConfig.topic.trim()) return toast.error("Please enter a topic");
    setIsGenerating(true);
    setGeneratedPosts([]);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a social media content expert. Generate ${bulkConfig.count} different ${bulkConfig.tone} social media posts for ${bulkConfig.platform} about: "${bulkConfig.topic}".

Space them out over ${bulkConfig.days} days starting from tomorrow.

Return a JSON object with a "posts" array. Each post has:
- title: short internal title (3-5 words)
- content: the post text
- hashtags: hashtags string
- day_offset: number of days from today (1 to ${bulkConfig.days})
- time: posting time like "09:00" or "18:00"`,
      response_json_schema: {
        type: "object",
        properties: {
          posts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
                hashtags: { type: "string" },
                day_offset: { type: "number" },
                time: { type: "string" },
              },
            },
          },
        },
      },
    });

    setGeneratedPosts(result.posts || []);
    setIsGenerating(false);
  };

  const handleScheduleAll = async () => {
    if (!generatedPosts.length) return;
    setIsGenerating(true);

    for (const post of generatedPosts) {
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + post.day_offset);
      const [hours, minutes] = (post.time || "09:00").split(":");
      scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      await base44.entities.Post.create({
        title: post.title,
        content: post.content,
        hashtags: post.hashtags,
        platform: bulkConfig.platform,
        tone: bulkConfig.tone,
        status: "scheduled",
        scheduled_date: scheduledDate.toISOString(),
        topic: bulkConfig.topic,
      });
    }

    queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success(`${generatedPosts.length} posts scheduled!`);
    setGeneratedPosts([]);
    setShowBulkGen(false);
    setIsGenerating(false);
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Automation</h1>
          <p className="text-gray-500 mt-1">Set up workflows to automate your social media strategy.</p>
        </div>
        <Button onClick={() => setShowBulkGen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Zap className="w-4 h-4 mr-2" /> Bulk Generate
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100/50">
          <CardContent className="p-5">
            <p className="text-sm text-indigo-600 font-medium">Active Workflows</p>
            <p className="text-3xl font-bold text-indigo-900 mt-1">{Object.values(workflowStates).filter(Boolean).length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="p-5">
            <p className="text-sm text-amber-600 font-medium">Posts This Week</p>
            <p className="text-3xl font-bold text-amber-900 mt-1">14</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <CardContent className="p-5">
            <p className="text-sm text-emerald-600 font-medium">Time Saved</p>
            <p className="text-3xl font-bold text-emerald-900 mt-1">4.2h</p>
          </CardContent>
        </Card>
      </div>

      {/* Workflows */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map(w => {
            const c = colorMap[w.color];
            const isOn = workflowStates[w.id];
            return (
              <Card key={w.id} className={`border-0 shadow-sm transition-all duration-200 ${isOn ? "ring-1 ring-indigo-100" : ""}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${c.bg}`}>
                      <w.icon className={`w-5 h-5 ${c.text}`} />
                    </div>
                    <Switch checked={isOn} onCheckedChange={() => toggleWorkflow(w.id)} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{w.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">{w.description}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <Badge className={`text-[11px] border-0 ${c.badge}`}>
                      <Clock className="w-3 h-3 mr-1" />{w.stats}
                    </Badge>
                    <Badge className={`border-0 text-[11px] ${isOn ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {isOn ? "● Active" : "○ Paused"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Automation Log */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Recent Automation Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { msg: "Daily Inspiration Post generated and scheduled for 8:00 AM", time: "2 hours ago", type: "success" },
              { msg: "Engagement Booster replied to 3 comments on Instagram", time: "5 hours ago", type: "success" },
              { msg: "Daily Inspiration Post published successfully", time: "Yesterday 8:00 AM", type: "success" },
              { msg: "Weekly Content Generator paused — awaiting approval", time: "2 days ago", type: "warning" },
            ].map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${log.type === "success" ? "bg-emerald-500" : "bg-amber-500"}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{log.msg}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{log.time}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Generate Dialog */}
      <Dialog open={showBulkGen} onOpenChange={v => { if (!v) { setShowBulkGen(false); setGeneratedPosts([]); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500" /> Bulk Content Generator
            </DialogTitle>
          </DialogHeader>

          {generatedPosts.length === 0 ? (
            <div className="space-y-5 py-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Topic / Niche</label>
                <Textarea
                  placeholder="e.g., Eco-friendly lifestyle products for young professionals..."
                  value={bulkConfig.topic}
                  onChange={e => setBulkConfig({ ...bulkConfig, topic: e.target.value })}
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Platform</label>
                  <Select value={bulkConfig.platform} onValueChange={v => setBulkConfig({ ...bulkConfig, platform: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">📘 Facebook</SelectItem>
                      <SelectItem value="instagram">📸 Instagram</SelectItem>
                      <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                      <SelectItem value="twitter">🐦 Twitter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Tone</label>
                  <Select value={bulkConfig.tone} onValueChange={v => setBulkConfig({ ...bulkConfig, tone: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Number of Posts</label>
                  <Select value={bulkConfig.count} onValueChange={v => setBulkConfig({ ...bulkConfig, count: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 posts</SelectItem>
                      <SelectItem value="5">5 posts</SelectItem>
                      <SelectItem value="7">7 posts</SelectItem>
                      <SelectItem value="10">10 posts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Spread over</label>
                  <Select value={bulkConfig.days} onValueChange={v => setBulkConfig({ ...bulkConfig, days: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto">
              <p className="text-sm text-gray-500 mb-3">{generatedPosts.length} posts ready to schedule:</p>
              {generatedPosts.map((post, i) => {
                const d = new Date();
                d.setDate(d.getDate() + post.day_offset);
                return (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-900">{post.title}</p>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <CalendarDays className="w-3 h-3" />
                        {d.toLocaleDateString("en", { month: "short", day: "numeric" })} {post.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{post.content}</p>
                    {post.hashtags && <p className="text-xs text-indigo-500 mt-1.5">{post.hashtags}</p>}
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button variant="outline" onClick={() => { setShowBulkGen(false); setGeneratedPosts([]); }}>Cancel</Button>
            {generatedPosts.length === 0 ? (
              <Button onClick={handleBulkGenerate} disabled={isGenerating || !bulkConfig.topic.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                {isGenerating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><Sparkles className="w-4 h-4 mr-2" />Generate</>}
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setGeneratedPosts([])} disabled={isGenerating}>Regenerate</Button>
                <Button onClick={handleScheduleAll} disabled={isGenerating} className="bg-emerald-600 hover:bg-emerald-700">
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CalendarDays className="w-4 h-4 mr-2" />}
                  Schedule All
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}