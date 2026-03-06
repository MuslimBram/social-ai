import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Pencil, Trash2, Copy, LayoutTemplate } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const categoryColors = {
  product_launch: "bg-indigo-100 text-indigo-700",
  event: "bg-amber-100 text-amber-700",
  blog_promo: "bg-violet-100 text-violet-700",
  seasonal: "bg-emerald-100 text-emerald-700",
  engagement: "bg-rose-100 text-rose-700",
  custom: "bg-gray-100 text-gray-600",
};

const platformEmoji = { facebook: "📘", instagram: "📸", linkedin: "💼", twitter: "🐦", all: "🌐" };

const starterTemplates = [
  {
    name: "Product Launch Announcement",
    description: "Announce a new product with excitement and urgency",
    platform: "instagram",
    tone: "promotional",
    category: "product_launch",
    template_text: "🚀 Introducing [PRODUCT NAME]! \n\nWe're thrilled to launch our latest [PRODUCT TYPE] that [KEY BENEFIT]. Designed for [TARGET AUDIENCE], it's everything you've been waiting for.\n\n✅ [Feature 1]\n✅ [Feature 2]\n✅ [Feature 3]\n\nAvailable now at [LINK]. Use code LAUNCH20 for 20% off! 🎉",
  },
  {
    name: "Weekly Engagement Question",
    description: "Drive comments and interactions with a question",
    platform: "facebook",
    tone: "friendly",
    category: "engagement",
    template_text: "Happy [DAY OF WEEK]! 👋\n\nWe want to hear from you — [QUESTION RELATED TO YOUR NICHE]?\n\nDrop your answer in the comments below! 👇\n\nWe'll share our favorites in our next post.",
  },
  {
    name: "Industry Tip Post",
    description: "Share valuable professional insights",
    platform: "linkedin",
    tone: "professional",
    category: "blog_promo",
    template_text: "💡 [NUMBER] Things Every [PROFESSION] Should Know About [TOPIC]:\n\n1️⃣ [Tip 1]\n2️⃣ [Tip 2]\n3️⃣ [Tip 3]\n4️⃣ [Tip 4]\n5️⃣ [Tip 5]\n\nWhich one resonates most with you? Let's discuss in the comments.",
  },
  {
    name: "Seasonal Promotion",
    description: "Run a seasonal or holiday campaign",
    platform: "all",
    tone: "promotional",
    category: "seasonal",
    template_text: "🎉 [HOLIDAY/SEASON] SALE IS HERE!\n\nCelebrate [HOLIDAY] with our biggest sale of the year:\n\n🔥 [DISCOUNT]% off everything\n⏰ Ends [DATE]\n📦 Free shipping on orders over [AMOUNT]\n\nShop now: [LINK]\n\n#[Holiday]Sale #[Brand]",
  },
  {
    name: "Event Invitation",
    description: "Invite followers to an upcoming event",
    platform: "all",
    tone: "friendly",
    category: "event",
    template_text: "📅 You're Invited!\n\nJoin us for [EVENT NAME] on [DATE] at [TIME].\n\n📍 [LOCATION/PLATFORM]\n\nWhat to expect:\n• [Session/Activity 1]\n• [Session/Activity 2]\n• [Session/Activity 3]\n\nRegister here: [LINK]\n\nLimited spots available — grab yours now! 🎟️",
  },
  {
    name: "Customer Testimonial",
    description: "Feature a happy customer story",
    platform: "instagram",
    tone: "friendly",
    category: "engagement",
    template_text: "⭐ Customer Love Corner!\n\n\"[CUSTOMER QUOTE]\" — [CUSTOMER NAME], [LOCATION/ROLE]\n\nHearing stories like [NAME]'s is why we do what we do. [HE/SHE/THEY] went from [BEFORE STATE] to [AFTER STATE] using [PRODUCT/SERVICE].\n\nWant results like [NAME]? Link in bio 👆",
  },
];

const emptyForm = { name: "", description: "", platform: "all", tone: "professional", category: "custom", template_text: "" };

export default function Templates() {
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => base44.entities.ContentTemplate.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContentTemplate.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["templates"] }); setShowDialog(false); setForm(emptyForm); toast.success("Template saved!"); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ContentTemplate.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["templates"] }); setEditTemplate(null); toast.success("Template updated!"); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ContentTemplate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["templates"] }),
  });

  const saveStarterTemplates = async () => {
    for (const t of starterTemplates) {
      await base44.entities.ContentTemplate.create(t);
    }
    queryClient.invalidateQueries({ queryKey: ["templates"] });
    toast.success("Starter templates imported!");
  };

  const allTemplates = [...templates];
  const filtered = allTemplates.filter(t => {
    const matchSearch = !search || t.name?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || t.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openEdit = (t) => { setEditTemplate({ ...t }); };

  const copyTemplate = (text) => { navigator.clipboard.writeText(text); toast.success("Template copied!"); };

  const useInGenerator = (t) => {
    sessionStorage.setItem("template_prefill", t.template_text);
    window.location.href = createPageUrl("PostGenerator");
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Templates</h1>
          <p className="text-gray-500 mt-1">Reusable templates to speed up your content creation.</p>
        </div>
        <div className="flex gap-2">
          {templates.length === 0 && (
            <Button variant="outline" onClick={saveStarterTemplates}>Import Starters</Button>
          )}
          <Button onClick={() => { setForm(emptyForm); setShowDialog(true); }} className="bg-indigo-600 hover:bg-indigo-700">
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search templates..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="product_launch">Product Launch</SelectItem>
            <SelectItem value="event">Event</SelectItem>
            <SelectItem value="blog_promo">Blog Promo</SelectItem>
            <SelectItem value="seasonal">Seasonal</SelectItem>
            <SelectItem value="engagement">Engagement</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Starter Showcase (if no templates) */}
      {templates.length === 0 && (
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-violet-50">
          <CardContent className="p-8 text-center">
            <LayoutTemplate className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
            <h3 className="font-semibold text-gray-900 mb-2">Start with Ready-Made Templates</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-md mx-auto">
              Import our 6 professionally crafted starter templates or create your own from scratch.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={saveStarterTemplates} className="bg-indigo-600 hover:bg-indigo-700">
                Import Starter Templates
              </Button>
              <Button variant="outline" onClick={() => { setForm(emptyForm); setShowDialog(true); }}>
                Create Custom
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Template Grid */}
      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(t => (
            <Card key={t.id} className="border-0 shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{t.name}</p>
                    {t.description && <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>}
                  </div>
                  <span className="text-lg ml-2">{platformEmoji[t.platform] || "📝"}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge className={`text-[10px] border-0 ${categoryColors[t.category] || categoryColors.custom}`}>
                    {t.category?.replace(/_/g, " ")}
                  </Badge>
                  {t.tone && <Badge variant="outline" className="text-[10px]">{t.tone}</Badge>}
                </div>
                <div className="flex-1 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 leading-relaxed line-clamp-4 mb-4">
                  {t.template_text}
                </div>
                <div className="flex gap-2 mt-auto">
                  <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => copyTemplate(t.template_text)}>
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                  <Button size="sm" className="flex-1 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => useInGenerator(t)}>
                    Use Template
                  </Button>
                  <button onClick={() => openEdit(t)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <Pencil className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(t.id)} className="p-2 hover:bg-rose-50 rounded-lg">
                    <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>New Template</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Template Name</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Product Launch Post" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Description</label>
              <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Short description..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Platform</label>
                <Select value={form.platform} onValueChange={v => setForm({ ...form, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">🌐 All</SelectItem>
                    <SelectItem value="facebook">📘 Facebook</SelectItem>
                    <SelectItem value="instagram">📸 Instagram</SelectItem>
                    <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                    <SelectItem value="twitter">🐦 Twitter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product_launch">Product Launch</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="blog_promo">Blog Promo</SelectItem>
                    <SelectItem value="seasonal">Seasonal</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Template Content <span className="text-gray-400 font-normal">(use [PLACEHOLDERS])</span></label>
              <Textarea value={form.template_text} onChange={e => setForm({ ...form, template_text: e.target.value })} placeholder="Write your template with [PLACEHOLDER] variables..." className="min-h-[150px]" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate(form)} className="bg-indigo-600 hover:bg-indigo-700">Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTemplate} onOpenChange={() => setEditTemplate(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Template</DialogTitle></DialogHeader>
          {editTemplate && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Template Name</label>
                <Input value={editTemplate.name || ""} onChange={e => setEditTemplate({ ...editTemplate, name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <Input value={editTemplate.description || ""} onChange={e => setEditTemplate({ ...editTemplate, description: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Template Content</label>
                <Textarea value={editTemplate.template_text || ""} onChange={e => setEditTemplate({ ...editTemplate, template_text: e.target.value })} className="min-h-[150px]" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTemplate(null)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate({ id: editTemplate.id, data: editTemplate })} className="bg-indigo-600 hover:bg-indigo-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}