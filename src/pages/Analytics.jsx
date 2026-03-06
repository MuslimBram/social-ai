import React, { useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Heart, MessageCircle, Share2, BarChart3 } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";

const COLORS = ["#6366f1", "#ec4899", "#0ea5e9", "#6b7280"];
const platformLabels = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", twitter: "Twitter" };

export default function Analytics() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 100),
  });

  const stats = useMemo(() => {
    const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0);
    const totalComments = posts.reduce((s, p) => s + (p.comments || 0), 0);
    const totalShares = posts.reduce((s, p) => s + (p.shares || 0), 0);
    const published = posts.filter(p => p.status === "published");
    const avgEngagement = published.length ? (published.reduce((s, p) => s + (p.engagement_rate || 0), 0) / published.length).toFixed(1) : 0;

    const byPlatform = {};
    posts.forEach(p => {
      if (!byPlatform[p.platform]) byPlatform[p.platform] = { name: platformLabels[p.platform] || p.platform, posts: 0, likes: 0, comments: 0 };
      byPlatform[p.platform].posts++;
      byPlatform[p.platform].likes += p.likes || 0;
      byPlatform[p.platform].comments += p.comments || 0;
    });

    const platformData = Object.values(byPlatform);
    const pieData = platformData.map(p => ({ name: p.name, value: p.posts }));

    return { totalLikes, totalComments, totalShares, avgEngagement, platformData, pieData };
  }, [posts]);

  const topPosts = useMemo(() => {
    return [...posts].sort((a, b) => ((b.likes || 0) + (b.comments || 0)) - ((a.likes || 0) + (a.comments || 0))).slice(0, 5);
  }, [posts]);

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your social media performance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Likes" value={stats.totalLikes.toLocaleString()} icon={Heart} color="rose" />
        <StatCard title="Total Comments" value={stats.totalComments.toLocaleString()} icon={MessageCircle} color="amber" />
        <StatCard title="Total Shares" value={stats.totalShares.toLocaleString()} icon={Share2} color="indigo" />
        <StatCard title="Avg. Engagement" value={`${stats.avgEngagement}%`} icon={TrendingUp} color="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Engagement by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {stats.platformData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.platformData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                    <Bar dataKey="likes" fill="#6366f1" radius={[6, 6, 0, 0]} name="Likes" />
                    <Bar dataKey="comments" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Comments" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400">No data yet. Start publishing posts!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Posts by Platform</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {stats.pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                      {stats.pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <BarChart3 className="w-10 h-10 text-gray-200" />
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {stats.pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-gray-600">{d.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Posts */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Top Performing Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {topPosts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No posts yet.</p>
          ) : (
            <div className="space-y-3">
              {topPosts.map((post, i) => (
                <div key={post.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <span className="text-lg font-bold text-gray-300 w-6 text-center">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                    <Badge variant="outline" className="text-[10px] mt-1">{post.platform}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" /> {post.likes || 0}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-amber-400" /> {post.comments || 0}</span>
                    <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5 text-indigo-400" /> {post.shares || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}