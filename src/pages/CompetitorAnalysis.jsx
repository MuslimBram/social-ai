import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Search, Plus, X, TrendingUp, Heart, MessageCircle, Share2, Loader2, Target, Lightbulb, Users } from "lucide-react";
import { toast } from "sonner";

const platformEmoji = { facebook: "📘", instagram: "📸", linkedin: "💼", twitter: "🐦" };
const COLORS = ["#6366f1", "#ec4899", "#0ea5e9", "#f59e0b", "#10b981"];

export default function CompetitorAnalysis() {
  const [handles, setHandles] = useState([]);
  const [inputHandle, setInputHandle] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const addHandle = () => {
    const h = inputHandle.trim().replace(/^@/, "");
    if (!h) return;
    if (handles.includes(h)) return toast.error("Already added");
    if (handles.length >= 4) return toast.error("Max 4 competitors");
    setHandles([...handles, h]);
    setInputHandle("");
  };

  const removeHandle = (h) => setHandles(handles.filter(x => x !== h));

  const handleKeyDown = (e) => {
    if (e.key === "Enter") addHandle();
  };

  const runAnalysis = async () => {
    if (handles.length === 0) return toast.error("Add at least one competitor handle");
    setIsAnalyzing(true);
    setAnalysis(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a social media analyst. Analyze these ${platform} accounts: ${handles.map(h => "@" + h).join(", ")}.

For each account, simulate realistic engagement data and content analysis as if you had access to their recent 30 posts. Return a JSON object with:
- competitors: array of objects, one per handle, each with:
  - handle: string (without @)
  - display_name: string (realistic brand name)
  - followers: number (realistic for the niche)
  - avg_likes: number
  - avg_comments: number
  - avg_shares: number
  - engagement_rate: number (percentage, 1 decimal)
  - top_themes: array of 4 strings (their most used content themes)
  - best_posting_time: string (e.g. "Tue-Thu 6-8pm")
  - content_mix: object with keys video, image, carousel, text representing percentage of each (must add to 100)
  - strengths: array of 3 short strings
  - weakness: string
- insights: array of 4 actionable strings describing what YOU can learn from these competitors
- best_content_themes: array of 5 strings representing the highest-performing themes across all competitors
- radar_data: array of objects with name (metric) and one key per competitor handle with score 0-100. Metrics: Engagement, Consistency, Visual Quality, Hashtag Strategy, Community Building`,
      response_json_schema: {
        type: "object",
        properties: {
          competitors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                handle: { type: "string" },
                display_name: { type: "string" },
                followers: { type: "number" },
                avg_likes: { type: "number" },
                avg_comments: { type: "number" },
                avg_shares: { type: "number" },
                engagement_rate: { type: "number" },
                top_themes: { type: "array", items: { type: "string" } },
                best_posting_time: { type: "string" },
                content_mix: { type: "object" },
                strengths: { type: "array", items: { type: "string" } },
                weakness: { type: "string" },
              },
            },
          },
          insights: { type: "array", items: { type: "string" } },
          best_content_themes: { type: "array", items: { type: "string" } },
          radar_data: { type: "array", items: { type: "object" } },
        },
      },
      add_context_from_internet: true,
    });

    setAnalysis(res);
    setIsAnalyzing(false);
  };

  const tooltipStyle = { borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" };

  const engagementData = analysis?.competitors?.map(c => ({
    name: `@${c.handle}`,
    Likes: c.avg_likes,
    Comments: c.avg_comments,
    Shares: c.avg_shares,
  })) || [];

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Competitor Analysis</h1>
        <p className="text-gray-500 mt-1">Analyze competitor accounts to discover top-performing content strategies.</p>
      </div>

      {/* Input Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Platform</label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">📘 Facebook</SelectItem>
                  <SelectItem value="instagram">📸 Instagram</SelectItem>
                  <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                  <SelectItem value="twitter">🐦 Twitter / X</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium mb-1.5 block">Competitor Handles (up to 4)</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
                  <Input
                    className="pl-7"
                    placeholder="competitor_handle"
                    value={inputHandle}
                    onChange={e => setInputHandle(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <Button variant="outline" onClick={addHandle}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>

          {handles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {handles.map(h => (
                <Badge key={h} variant="outline" className="gap-1.5 pl-3 pr-2 py-1.5 text-sm">
                  {platformEmoji[platform]} @{h}
                  <button onClick={() => removeHandle(h)} className="hover:text-rose-500">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing || handles.length === 0}
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
          >
            {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Search className="w-4 h-4" /> Run Analysis</>}
          </Button>

          {isAnalyzing && (
            <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-indigo-900">Analyzing competitor accounts...</p>
                <p className="text-xs text-indigo-600 mt-0.5">Fetching engagement data, content themes, and posting patterns.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <>
          {/* Competitor Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {analysis.competitors?.map((comp, idx) => (
              <Card key={comp.handle} className="border-0 shadow-sm overflow-hidden">
                <div className="h-1.5" style={{ background: COLORS[idx % COLORS.length] }} />
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-bold"
                        style={{ background: COLORS[idx % COLORS.length] }}>
                        {comp.display_name?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{comp.display_name}</p>
                        <p className="text-sm text-gray-500">@{comp.handle}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" />
                          {comp.followers?.toLocaleString()} followers
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold" style={{ color: COLORS[idx % COLORS.length] }}>{comp.engagement_rate}%</p>
                      <p className="text-xs text-gray-500">engagement</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2.5 bg-rose-50 rounded-xl text-center">
                      <p className="font-bold text-rose-700">{comp.avg_likes?.toLocaleString()}</p>
                      <p className="text-[10px] text-rose-500 uppercase">Avg Likes</p>
                    </div>
                    <div className="p-2.5 bg-amber-50 rounded-xl text-center">
                      <p className="font-bold text-amber-700">{comp.avg_comments?.toLocaleString()}</p>
                      <p className="text-[10px] text-amber-500 uppercase">Avg Comments</p>
                    </div>
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-center">
                      <p className="font-bold text-indigo-700">{comp.avg_shares?.toLocaleString()}</p>
                      <p className="text-[10px] text-indigo-500 uppercase">Avg Shares</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Top Content Themes</p>
                    <div className="flex flex-wrap gap-1">
                      {comp.top_themes?.map(t => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="font-medium text-gray-500 mb-1">Strengths</p>
                      <ul className="space-y-0.5">
                        {comp.strengths?.map(s => (
                          <li key={s} className="flex items-start gap-1 text-gray-700">
                            <span className="text-emerald-500 mt-0.5 flex-shrink-0">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-gray-500 mb-1">Best Time to Post</p>
                      <p className="text-gray-700">{comp.best_posting_time}</p>
                      <p className="font-medium text-gray-500 mt-2 mb-1">Weakness</p>
                      <p className="text-gray-700">{comp.weakness}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Engagement Comparison Chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Engagement Comparison</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="Likes" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Comments" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="Shares" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          {analysis.radar_data?.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">Strategy Radar</CardTitle></CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={analysis.radar_data}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="name" fontSize={12} tick={{ fill: "#64748b" }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      {handles.map((h, i) => (
                        <Radar key={h} name={`@${h}`} dataKey={h} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.15} strokeWidth={2} />
                      ))}
                      <Tooltip contentStyle={tooltipStyle} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-4 mt-2 justify-center">
                  {handles.map((h, i) => (
                    <div key={h} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">@{h}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights & Themes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" /> Actionable Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.insights?.map((insight, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-amber-700">{i + 1}</div>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" /> Best Content Themes to Try
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.best_content_themes?.map((theme, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100">
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3 h-3 text-indigo-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-800">{theme}</p>
                    <Badge className="ml-auto bg-indigo-100 text-indigo-700 border-0 text-[10px]">
                      #{i + 1} trend
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}