import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const platformStyles = {
  facebook: "bg-blue-50 text-blue-700 border-blue-200",
  instagram: "bg-pink-50 text-pink-700 border-pink-200",
  linkedin: "bg-sky-50 text-sky-700 border-sky-200",
  twitter: "bg-gray-50 text-gray-700 border-gray-200",
};

const statusStyles = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
};

export default function RecentPostsList({ posts, isLoading }) {
  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="text-base">Recent Posts</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Recent Posts</CardTitle>
      </CardHeader>
      <CardContent>
        {posts?.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">No posts yet. Start generating!</p>
        ) : (
          <div className="space-y-3">
            {posts?.slice(0, 5).map((post) => (
              <div key={post.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                {post.image_url ? (
                  <img src={post.image_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-lg">
                    📝
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{post.content?.slice(0, 60)}...</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${platformStyles[post.platform]}`}>
                      {post.platform}
                    </Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 border-0 ${statusStyles[post.status]}`}>
                      {post.status}
                    </Badge>
                    <span className="text-[10px] text-gray-400">
                      {format(new Date(post.created_date), "MMM d")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}