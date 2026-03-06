import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { FileText, CalendarDays, TrendingUp, Eye, Sparkles, ImagePlus, LayoutTemplate, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import StatCard from "../components/dashboard/StatCard";
import RecentPostsList from "../components/dashboard/RecentPostsList";
import UpcomingPosts from "../components/dashboard/UpcomingPosts";
import EngagementChart from "../components/dashboard/EngagementChart";
import PlatformBreakdown from "../components/dashboard/PlatformBreakdown";

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

  const quickActions = [
    { label: "Generate Post", icon: Sparkles, page: "PostGenerator", color: "from-indigo-500 to-violet-600", desc: "AI-powered content" },
    { label: "Create Image", icon: ImagePlus, page: "ImageGenerator", color: "from-violet-500 to-pink-500", desc: "AI visuals" },
    { label: "Templates", icon: LayoutTemplate, page: "Templates", color: "from-amber-500 to-orange-500", desc: "Ready-to-use" },
    { label: "Automation", icon: Bot, page: "Automation", color: "from-emerald-500 to-teal-600", desc: "Bulk generate" },
  ];

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back 👋</h1>
        <p className="text-gray-500 mt-1">Here's an overview of your social media performance today.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {quickActions.map(action => (
          <Link key={action.page} to={createPageUrl(action.page)}>
            <div className="group p-4 rounded-2xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-transparent hover:scale-[1.02] cursor-pointer">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900">{action.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Posts" value={totalPosts} icon={FileText} color="indigo" change={12} />
        <StatCard title="Scheduled" value={scheduledPosts} icon={CalendarDays} color="amber" change={8} />
        <StatCard title="Total Likes" value={totalLikes.toLocaleString()} icon={TrendingUp} color="emerald" change={24} />
        <StatCard title="Avg. Engagement" value={`${avgEngagement}%`} icon={Eye} color="violet" change={-3} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EngagementChart posts={posts} />
        </div>
        <UpcomingPosts posts={posts} isLoading={isLoading} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentPostsList posts={posts} isLoading={isLoading} />
        </div>
        <PlatformBreakdown posts={posts} accounts={accounts} />
      </div>
    </div>
  );
}