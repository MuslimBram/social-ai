import React, { useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from "recharts";
import { TrendingUp, Heart, MessageCircle, Share2, BarChart3, Download, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, subDays, startOfDay } from "date-fns";
import StatCard from "../components/dashboard/StatCard";

const COLORS = ["#6366f1", "#ec4899", "#0ea5e9", "#6b7280"];
const platformLabels = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", twitter: "Twitter" };
const platformEmoji = { facebook: "📘", instagram: "📸", linkedin: "💼", twitter: "🐦" };

export default function Analytics() {
  const [dateRange, setDateRange] = useState("30");
  const [viewPost, setViewPost] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 200),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => base44.entities.SocialAccount.list(),
  });

  const cutoff = useMemo(() => subDays(new Date(), parseInt(dateRange)), [dateRange]);

  const filteredPosts = useMemo(() =>
    posts.filter(p => new Date(p.created_date) >= cutoff),
    [posts, cutoff]
  );

  const stats = useMemo(() => {
    const totalLikes = filteredPosts.reduce((s, p) => s + (p.likes || 0), 0);
    const totalComments = filteredPosts.reduce((s, p) => s + (p.comments || 0), 0);
    const totalShares = filteredPosts.reduce((s, p) => s + (p.shares || 0), 0);
    const published = filteredPosts.filter(p => p.status === "published");
    const avgEngagement = published.length
      ? (published.reduce((s, p) => s + (p.engagement_rate || 0), 0) / published.length).toFixed(1)
      : 0;

    const byPlatform = {};
    filteredPosts.forEach(p => {
      if (!byPlatform[p.platform]) byPlatform[p.platform] = { name: platformLabels[p.platform] || p.platform, posts: 0, likes: 0, comments: 0, shares: 0 };
      byPlatform[p.platform].posts++;
      byPlatform[p.platform].likes += p.likes || 0;
      byPlatform[p.platform].comments += p.comments || 0;
      byPlatform[p.platform].shares += p.shares || 0;
    });

    const platformData = Object.values(byPlatform);
    const pieData = platformData.map(p => ({ name: p.name, value: p.posts }));

    return { totalLikes, totalComments, totalShares, avgEngagement, platformData, pieData, publishedCount: published.length };
  }, [filteredPosts]);

  const trendData = useMemo(() => {
    const days = parseInt(dateRange) <= 7 ? parseInt(dateRange) : Math.min(parseInt(dateRange), 14);
    return Array.from({ length: days }, (_, i) => {
      const day = subDays(new Date(), days - 1 - i);
      const dayStr = startOfDay(day).toISOString().split("T")[0];
      const dayPosts = filteredPosts.filter(p => p.created_date?.startsWith(dayStr));
      return {
        day: format(day, days <= 7 ? "EEE" : "MMM d"),
        likes: dayPosts.reduce((s, p) => s + (p.likes || 0), 0),
        comments: dayPosts.reduce((s, p) => s + (p.comments || 0), 0),
        shares: dayPosts.reduce((s, p) => s + (p.shares || 0), 0),
        posts: dayPosts.length,
      };
    });
  }, [filteredPosts, dateRange]);

  const topPosts = useMemo(() =>
    [...filteredPosts]
      .filter(p => p.status === "published")
      .sort((a, b) => ((b.likes || 0) + (b.comments || 0) + (b.shares || 0)) - ((a.likes || 0) + (a.comments || 0) + (a.shares || 0)))
      .slice(0, 10),
    [filteredPosts]
  );

  const exportCSV = () => {
    const rows = [
      ["Title", "Platform", "Status", "Likes", "Comments", "Shares", "Engagement Rate", "Date"],
      ...filteredPosts.map(p => [p.title, p.platform, p.status, p.likes || 0, p.comments || 0, p.shares || 0, p.engagement_rate || 0, p.created_date?.split("T")[0]])
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${dateRange}days.csv`;
    a.click();
  };

  const tooltipStyle = { borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" };

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-500 mt-1">Track your social media performance across all platforms.</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="posts">Post Performance</TabsTrigger>
          <TabsTrigger value="platforms">By Platform</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Likes" value={stats.totalLikes.toLocaleString()} icon={Heart} color="rose" change={14} />
            <StatCard title="Comments" value={stats.totalComments.toLocaleString()} icon={MessageCircle} color="amber" change={8} />
            <StatCard title="Shares" value={stats.totalShares.toLocaleString()} icon={Share2} color="indigo" change={22} />
            <StatCard title="Avg. Engagement" value={`${stats.avgEngagement}%`} icon={TrendingUp} color="emerald" change={-2} />
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Published Posts</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.publishedCount}</p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" /> 12%
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Connected Accounts</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{accounts.filter(a => a.is_active).length}</p>
                  </div>
                  <div className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                    {accounts.length} total
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Reach</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {((stats.totalLikes + stats.totalComments + stats.totalShares) * 4.2).toFixed(0)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                    <ArrowUpRight className="w-4 h-4" /> 31%
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trend chart */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Engagement Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                {trendData.some(d => d.likes > 0 || d.comments > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <defs>
                        <linearGradient id="gLikes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gComments" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gShares" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={11} tick={{ fill: "#94a3b8" }} />
                      <YAxis axisLine={false} tickLine={false} fontSize={11} tick={{ fill: "#94a3b8" }} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Area type="monotone" dataKey="likes" name="Likes" stroke="#6366f1" fill="url(#gLikes)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="comments" name="Comments" stroke="#f59e0b" fill="url(#gComments)" strokeWidth={2} dot={false} />
                      <Area type="monotone" dataKey="shares" name="Shares" stroke="#10b981" fill="url(#gShares)" strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <BarChart3 className="w-10 h-10 text-gray-200 mb-3" />
                    <p className="text-sm text-gray-400">No engagement data for this period</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Posts Performance Tab */}
      {activeTab === "posts" && (
        <div className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Top Performing Posts</CardTitle>
            </CardHeader>
            <CardContent>
              {topPosts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No published posts in this period.</p>
              ) : (
                <div className="space-y-2">
                  {topPosts.map((post, i) => {
                    const total = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
                    const maxTotal = (topPosts[0].likes || 0) + (topPosts[0].comments || 0) + (topPosts[0].shares || 0);
                    const pct = maxTotal ? (total / maxTotal) * 100 : 0;
                    return (
                      <div
                        key={post.id}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group"
                        onClick={() => setViewPost(post)}
                      >
                        <span className="text-sm font-bold text-gray-300 w-5 text-center flex-shrink-0">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                            <span className="text-lg flex-shrink-0">{platformEmoji[post.platform]}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 flex-shrink-0">
                          <span className="flex items-center gap-1"><Heart className="w-3 h-3 text-rose-400" />{post.likes || 0}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3 text-amber-400" />{post.comments || 0}</span>
                          <span className="flex items-center gap-1"><Share2 className="w-3 h-3 text-indigo-400" />{post.shares || 0}</span>
                        </div>
                        <Eye className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* By Platform Tab */}
      {activeTab === "platforms" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Engagement by Platform</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {stats.platformData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.platformData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                      <YAxis axisLine={false} tickLine={false} fontSize={12} />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: "12px" }} />
                      <Bar dataKey="likes" name="Likes" fill="#6366f1" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="comments" name="Comments" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="shares" name="Shares" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-sm text-gray-400">No data yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Posts Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[220px]">
                {stats.pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                        {stats.pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <BarChart3 className="w-10 h-10 text-gray-200" />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3 mt-3 justify-center">
                {stats.pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-gray-600">{d.name} ({d.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Per-platform detail cards */}
          {stats.platformData.map((p, i) => (
            <Card key={p.name} className="border-0 shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: COLORS[i % COLORS.length] + "20" }}>
                    {platformEmoji[p.name.toLowerCase()] || "📱"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.posts} posts</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-rose-50 rounded-xl">
                    <p className="text-lg font-bold text-rose-700">{p.likes.toLocaleString()}</p>
                    <p className="text-[10px] text-rose-500 uppercase tracking-wide">Likes</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl">
                    <p className="text-lg font-bold text-amber-700">{p.comments.toLocaleString()}</p>
                    <p className="text-[10px] text-amber-500 uppercase tracking-wide">Comments</p>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <p className="text-lg font-bold text-indigo-700">{p.shares.toLocaleString()}</p>
                    <p className="text-[10px] text-indigo-500 uppercase tracking-wide">Shares</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Post Detail Dialog */}
      <Dialog open={!!viewPost} onOpenChange={() => setViewPost(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewPost?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {viewPost?.image_url && (
              <img src={viewPost.image_url} alt="" className="w-full rounded-xl object-cover max-h-56" />
            )}
            <p className="text-sm text-gray-700 leading-relaxed">{viewPost?.content}</p>
            {viewPost?.hashtags && (
              <p className="text-sm text-indigo-500">{viewPost.hashtags}</p>
            )}
            <div className="grid grid-cols-4 gap-3 pt-2">
              {[
                { label: "Likes", value: viewPost?.likes || 0, color: "rose" },
                { label: "Comments", value: viewPost?.comments || 0, color: "amber" },
                { label: "Shares", value: viewPost?.shares || 0, color: "indigo" },
                { label: "Engagement", value: `${viewPost?.engagement_rate || 0}%`, color: "emerald" },
              ].map(s => (
                <div key={s.label} className={`p-3 bg-${s.color}-50 rounded-xl text-center`}>
                  <p className={`text-lg font-bold text-${s.color}-700`}>{s.value}</p>
                  <p className={`text-[10px] text-${s.color}-500 uppercase`}>{s.label}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="outline" className="text-xs">{platformEmoji[viewPost?.platform]} {viewPost?.platform}</Badge>
              <Badge variant="outline" className="text-xs capitalize">{viewPost?.tone}</Badge>
              <span className="text-xs text-gray-400 ml-auto">
                {viewPost?.created_date && format(new Date(viewPost.created_date), "MMM d, yyyy")}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}