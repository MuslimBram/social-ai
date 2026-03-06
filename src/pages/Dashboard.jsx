import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { FileText, CalendarDays, TrendingUp, Eye } from "lucide-react";
import StatCard from "../components/dashboard/StatCard";
import RecentPostsList from "../components/dashboard/RecentPostsList";
import UpcomingPosts from "../components/dashboard/UpcomingPosts";
import EngagementChart from "../components/dashboard/EngagementChart";

export default function Dashboard() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 50),
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => base44.entities.SocialAccount.list(),
  });

  const totalPosts = posts.length;
  const scheduledPosts = posts.filter(p => p.status === "scheduled").length;
  const totalLikes = posts.reduce((s, p) => s + (p.likes || 0), 0);
  const totalEngagement = posts.reduce((s, p) => s + (p.engagement_rate || 0), 0);
  const avgEngagement = totalPosts ? (totalEngagement / totalPosts).toFixed(1) : 0;

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your social media today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Posts" value={totalPosts} icon={FileText} color="indigo" change={12} />
        <StatCard title="Scheduled" value={scheduledPosts} icon={CalendarDays} color="amber" change={8} />
        <StatCard title="Total Likes" value={totalLikes.toLocaleString()} icon={TrendingUp} color="emerald" change={24} />
        <StatCard title="Avg. Engagement" value={`${avgEngagement}%`} icon={Eye} color="violet" change={-3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EngagementChart posts={posts} />
        </div>
        <UpcomingPosts posts={posts} isLoading={isLoading} />
      </div>

      <RecentPostsList posts={posts} isLoading={isLoading} />
    </div>
  );
}