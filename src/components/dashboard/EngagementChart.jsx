import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function EngagementChart({ posts }) {
  const chartData = React.useMemo(() => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayPosts = posts?.filter(p => p.created_date?.startsWith(dateStr)) || [];
      last7Days.push({
        day: date.toLocaleDateString("en", { weekday: "short" }),
        likes: dayPosts.reduce((sum, p) => sum + (p.likes || 0), 0),
        comments: dayPosts.reduce((sum, p) => sum + (p.comments || 0), 0),
        posts: dayPosts.length,
      });
    }
    return last7Days;
  }, [posts]);

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Engagement Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: "#94a3b8" }} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
              />
              <Area type="monotone" dataKey="likes" stroke="#6366f1" fillOpacity={1} fill="url(#colorLikes)" strokeWidth={2} />
              <Area type="monotone" dataKey="comments" stroke="#f59e0b" fillOpacity={1} fill="url(#colorComments)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}