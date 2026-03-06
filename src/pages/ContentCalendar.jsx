import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus, Clock, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const platformEmoji = { facebook: "📘", instagram: "📸", linkedin: "💼", twitter: "🐦" };

export default function ContentCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", platform: "instagram", scheduled_date: "", scheduled_time: "10:00" });
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 100),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Post.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setShowScheduleDialog(false);
      setNewPost({ title: "", content: "", platform: "instagram", scheduled_date: "", scheduled_time: "10:00" });
      toast.success("Post scheduled!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Post.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["posts"] }),
  });

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    const days = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const getPostsForDay = (day) => {
    return posts.filter(p => p.scheduled_date && isSameDay(new Date(p.scheduled_date), day));
  };

  const handleSchedule = () => {
    if (!newPost.title) return toast.error("Title is required");
    const dateTime = `${newPost.scheduled_date}T${newPost.scheduled_time}:00`;
    createMutation.mutate({
      ...newPost,
      scheduled_date: dateTime,
      status: "scheduled",
    });
  };

  const openScheduleForDate = (day) => {
    setSelectedDate(day);
    setNewPost(prev => ({ ...prev, scheduled_date: format(day, "yyyy-MM-dd") }));
    setShowScheduleDialog(true);
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Calendar</h1>
          <p className="text-gray-500 mt-1">Plan and schedule your social media content.</p>
        </div>
        <Button onClick={() => { setNewPost(prev => ({ ...prev, scheduled_date: format(new Date(), "yyyy-MM-dd") })); setShowScheduleDialog(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Schedule Post
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{format(currentMonth, "MMMM yyyy")}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())}>Today</Button>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <div key={d} className="bg-gray-50 p-3 text-center text-xs font-medium text-gray-500 uppercase">
                {d}
              </div>
            ))}
            {calendarDays.map((day, i) => {
              const dayPosts = getPostsForDay(day);
              const inMonth = isSameMonth(day, currentMonth);
              return (
                <div
                  key={i}
                  onClick={() => openScheduleForDate(day)}
                  className={cn(
                    "bg-white p-2 min-h-[100px] cursor-pointer hover:bg-indigo-50/50 transition-colors",
                    !inMonth && "bg-gray-50/50"
                  )}
                >
                  <span className={cn(
                    "text-sm font-medium inline-flex items-center justify-center w-7 h-7 rounded-full",
                    isToday(day) && "bg-indigo-600 text-white",
                    !inMonth && "text-gray-300",
                    inMonth && !isToday(day) && "text-gray-700"
                  )}>
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayPosts.slice(0, 2).map(post => (
                      <div key={post.id} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 truncate flex items-center gap-1">
                        <span>{platformEmoji[post.platform]}</span>
                        <span className="truncate">{post.title}</span>
                      </div>
                    ))}
                    {dayPosts.length > 2 && (
                      <span className="text-[10px] text-gray-400">+{dayPosts.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day posts */}
      {selectedDate && getPostsForDay(selectedDate).length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Posts on {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getPostsForDay(selectedDate).map(post => (
                <div key={post.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                  <span className="text-xl">{platformEmoji[post.platform]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{post.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        {format(new Date(post.scheduled_date), "h:mm a")}
                      </span>
                      <Badge variant="outline" className="text-[10px]">{post.status}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(post.id)}>
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule a Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title</label>
              <Input value={newPost.title} onChange={e => setNewPost({ ...newPost, title: e.target.value })} placeholder="Post title" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Content</label>
              <Textarea value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })} placeholder="Write your post..." className="min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Platform</label>
                <Select value={newPost.platform} onValueChange={v => setNewPost({ ...newPost, platform: v })}>
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
                <label className="text-sm font-medium mb-1.5 block">Time</label>
                <Input type="time" value={newPost.scheduled_time} onChange={e => setNewPost({ ...newPost, scheduled_time: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Date</label>
              <Input type="date" value={newPost.scheduled_date} onChange={e => setNewPost({ ...newPost, scheduled_date: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>Cancel</Button>
            <Button onClick={handleSchedule} className="bg-indigo-600 hover:bg-indigo-700">
              <Clock className="w-4 h-4 mr-2" /> Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}