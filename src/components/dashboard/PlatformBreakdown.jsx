import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#6366f1", "#ec4899", "#0ea5e9", "#6b7280"];
const platformEmoji = { facebook: "📘", instagram: "📸", linkedin: "💼", twitter: "🐦" };
const platformLabels = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", twitter: "Twitter" };

export default function PlatformBreakdown({ posts, accounts }) {
  const byPlatform = {};
  posts.forEach(p => {
    if (!p.platform) return;
    byPlatform[p.platform] = (byPlatform[p.platform] || 0) + 1;
  });

  const data = Object.entries(byPlatform).map(([platform, count]) => ({
    name: platformLabels[platform] || platform,
    platform,
    value: count,
  }));

  if (data.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base font-semibold">Platform Breakdown</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400 text-center py-8">No posts yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader><CardTitle className="text-base font-semibold">Platform Breakdown</CardTitle></CardHeader>
      <CardContent>
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2 mt-3">
          {data.map((d, i) => (
            <div key={d.platform} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-sm text-gray-600">{platformEmoji[d.platform]} {d.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{d.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}