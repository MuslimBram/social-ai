import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock } from "lucide-react";
import { format } from "date-fns";

export default function UpcomingPosts({ posts, isLoading }) {
  const scheduled = posts?.filter(p => p.status === "scheduled" && p.scheduled_date)
    .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
    .slice(0, 5);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">Upcoming</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-16 bg-gray-50 rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Upcoming Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {!scheduled?.length ? (
          <div className="text-center py-8">
            <CalendarDays className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No scheduled posts</p>
          </div>
        ) : (
          <div className="space-y-2">
            {scheduled.map(post => (
              <div key={post.id} className="p-3 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
                <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {format(new Date(post.scheduled_date), "MMM d, h:mm a")}
                  </span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto">
                    {post.platform}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}