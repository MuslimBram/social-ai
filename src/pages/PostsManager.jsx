import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Filter, Pencil, Trash2, Eye, Plus, FileText,
  Heart, MessageCircle, Share2, Calendar
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const platformEmoji = { facebook: "📘", instagram: "📸", linkedin: "💼", twitter: "🐦" };
const statusColors = {
  draft: "bg-gray-100 text-gray-600",
  scheduled: "bg-amber-100 text-amber-700",
  published: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
};
const platformColors = {
  facebook: "bg-blue-50 text-blue-700 border-blue-200",
  instagram: "bg-pink-50 text-pink-700 border-pink-200",
  linkedin: "bg-sky-50 text-sky-700 border-sky-200",
  twitter: "bg-gray-50 text-gray-700 border-gray-200",
};

export default function PostsManager() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [editPost, setEditPost] = useState(null);
  const [viewPost, setViewPost] = useState(null);
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 100),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Post.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setEditPost(null);
      toast.success("Post updated!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Post.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post deleted");
    },
  });

  const filtered = posts.filter(p => {
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.content?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    const matchPlatform = filterPlatform === "all" || p.platform === filterPlatform;
    return matchSearch && matchStatus && matchPlatform;
  });

  const counts = {
    all: posts.length,
    draft: posts.filter(p => p.status === "draft").length,
    scheduled: posts.filter(p => p.status === "scheduled").length,
    published: posts.filter(p => p.status === "published").length,
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts Manager</h1>
          <p className="text-gray-500 mt-1">Manage all your social media posts.</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link to={createPageUrl("PostGenerator")}>
            <Plus className="w-4 h-4 mr-2" /> Create Post
          </Link>
        </Button>
      </div>

      {/* Status Tabs */}
      <Tabs value={filterStatus} onValueChange={setFilterStatus}>
        <TabsList className="bg-gray-100">
          {["all", "draft", "scheduled", "published"].map(s => (
            <TabsTrigger key={s} value={s} className="capitalize gap-2">
              {s}
              <span className="bg-white text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                {counts[s]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="w-3.5 h-3.5 mr-2 text-gray-400" />
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Platforms</SelectItem>
            <SelectItem value="facebook">📘 Facebook</SelectItem>
            <SelectItem value="instagram">📸 Instagram</SelectItem>
            <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
            <SelectItem value="twitter">🐦 Twitter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse h-20 bg-white rounded-2xl shadow-sm" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FileText className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No posts found</p>
            <p className="text-sm text-gray-400 mt-1">Try changing your filters or create a new post.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => (
            <Card key={post.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {post.image_url ? (
                    <img src={post.image_url} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center text-2xl flex-shrink-0">
                      {platformEmoji[post.platform] || "📝"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => setViewPost(post)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => setEditPost({ ...post })} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4 text-gray-400" />
                        </button>
                        <button onClick={() => deleteMutation.mutate(post.id)} className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4 text-gray-400 hover:text-rose-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{post.content?.slice(0, 100)}{post.content?.length > 100 ? "..." : ""}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${platformColors[post.platform]}`}>
                        {platformEmoji[post.platform]} {post.platform}
                      </Badge>
                      <Badge className={`text-[10px] px-1.5 py-0 border-0 ${statusColors[post.status]}`}>
                        {post.status}
                      </Badge>
                      {post.scheduled_date && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(post.scheduled_date), "MMM d, h:mm a")}
                        </span>
                      )}
                      {post.status === "published" && (
                        <div className="flex items-center gap-3 ml-auto text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-rose-400" />{post.likes || 0}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-amber-400" />{post.comments || 0}</span>
                          <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5 text-indigo-400" />{post.shares || 0}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={!!viewPost} onOpenChange={() => setViewPost(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewPost?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {viewPost?.image_url && (
              <img src={viewPost.image_url} alt="" className="w-full rounded-xl object-cover max-h-64" />
            )}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Content</p>
              <p className="text-sm text-gray-700 leading-relaxed">{viewPost?.content}</p>
            </div>
            {viewPost?.caption && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Caption</p>
                <p className="text-sm text-gray-700">{viewPost.caption}</p>
              </div>
            )}
            {viewPost?.hashtags && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hashtags</p>
                <p className="text-sm text-indigo-600">{viewPost.hashtags}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Badge variant="outline" className={platformColors[viewPost?.platform]}>
                {platformEmoji[viewPost?.platform]} {viewPost?.platform}
              </Badge>
              <Badge className={`border-0 ${statusColors[viewPost?.status]}`}>{viewPost?.status}</Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editPost} onOpenChange={() => setEditPost(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          {editPost && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <Input value={editPost.title || ""} onChange={e => setEditPost({ ...editPost, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Content</label>
                <Textarea value={editPost.content || ""} onChange={e => setEditPost({ ...editPost, content: e.target.value })} className="min-h-[100px]" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Hashtags</label>
                <Input value={editPost.hashtags || ""} onChange={e => setEditPost({ ...editPost, hashtags: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Platform</label>
                  <Select value={editPost.platform} onValueChange={v => setEditPost({ ...editPost, platform: v })}>
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
                  <label className="text-sm font-medium mb-1.5 block">Status</label>
                  <Select value={editPost.status} onValueChange={v => setEditPost({ ...editPost, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPost(null)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate({ id: editPost.id, data: editPost })} className="bg-indigo-600 hover:bg-indigo-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}