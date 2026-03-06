import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2, Users, TrendingUp, FileText, Eye, Pencil, Link2 } from "lucide-react";
import { toast } from "sonner";
import PlatformIcon from "../components/shared/PlatformIcon";

const platformConfig = {
  facebook: { color: "blue", gradient: "from-blue-500 to-blue-600" },
  instagram: { color: "pink", gradient: "from-pink-500 to-rose-500" },
  linkedin: { color: "sky", gradient: "from-sky-500 to-blue-600" },
  twitter: { color: "gray", gradient: "from-gray-600 to-gray-700" },
};

export default function Accounts() {
  const [showDialog, setShowDialog] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [form, setForm] = useState({ platform: "instagram", account_name: "", handle: "", followers_count: "" });
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => base44.entities.SocialAccount.list("-created_date"),
  });

  const { data: posts = [] } = useQuery({
    queryKey: ["posts"],
    queryFn: () => base44.entities.Post.list("-created_date", 200),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SocialAccount.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setShowDialog(false);
      resetForm();
      toast.success("Account added!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SocialAccount.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setEditAccount(null);
      toast.success("Account updated!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SocialAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account removed");
    },
  });

  const resetForm = () => setForm({ platform: "instagram", account_name: "", handle: "", followers_count: "" });

  const handleAdd = () => {
    if (!form.account_name) return toast.error("Account name is required");
    createMutation.mutate({ ...form, is_active: true, followers_count: parseInt(form.followers_count) || 0 });
  };

  const handleUpdate = () => {
    if (!editAccount.account_name) return toast.error("Account name is required");
    updateMutation.mutate({
      id: editAccount.id,
      data: { ...editAccount, followers_count: parseInt(editAccount.followers_count) || 0 }
    });
  };

  const getAccountPosts = (account) =>
    posts.filter(p => p.account_id === account.id || p.platform === account.platform);

  const getAccountStats = (account) => {
    const ap = getAccountPosts(account).filter(p => p.status === "published");
    return {
      posts: ap.length,
      likes: ap.reduce((s, p) => s + (p.likes || 0), 0),
      engagement: ap.length ? (ap.reduce((s, p) => s + (p.engagement_rate || 0), 0) / ap.length).toFixed(1) : 0,
    };
  };

  const activeCount = accounts.filter(a => a.is_active).length;
  const totalFollowers = accounts.reduce((s, a) => s + (a.followers_count || 0), 0);

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Accounts</h1>
          <p className="text-gray-500 mt-1">Manage and monitor all your connected social media accounts.</p>
        </div>
        <Button onClick={() => { resetForm(); setShowDialog(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Add Account
        </Button>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100/30">
          <CardContent className="p-5">
            <p className="text-sm text-indigo-600 font-medium">Connected Accounts</p>
            <p className="text-3xl font-bold text-indigo-900 mt-1">{accounts.length}</p>
            <p className="text-xs text-indigo-500 mt-1">{activeCount} active</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/30">
          <CardContent className="p-5">
            <p className="text-sm text-emerald-600 font-medium">Total Followers</p>
            <p className="text-3xl font-bold text-emerald-900 mt-1">{totalFollowers.toLocaleString()}</p>
            <p className="text-xs text-emerald-500 mt-1">across all platforms</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-violet-100/30">
          <CardContent className="p-5">
            <p className="text-sm text-violet-600 font-medium">Published Posts</p>
            <p className="text-3xl font-bold text-violet-900 mt-1">
              {posts.filter(p => p.status === "published").length}
            </p>
            <p className="text-xs text-violet-500 mt-1">total across accounts</p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-0 shadow-sm animate-pulse">
              <CardContent className="p-6"><div className="h-28 bg-gray-50 rounded-xl" /></CardContent>
            </Card>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
            <p className="text-gray-700 font-semibold">No accounts connected</p>
            <p className="text-sm text-gray-400 mt-1 text-center max-w-sm">
              Connect your first social media account to start publishing AI-generated content.
            </p>
            <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700" onClick={() => { resetForm(); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {accounts.map(account => {
            const stats = getAccountStats(account);
            const pc = platformConfig[account.platform] || platformConfig.facebook;
            return (
              <Card key={account.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {/* Platform header stripe */}
                <div className={`h-1.5 bg-gradient-to-r ${pc.gradient}`} />
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <PlatformIcon platform={account.platform} size="lg" />
                      <div>
                        <p className="font-bold text-gray-900">{account.account_name}</p>
                        {account.handle && <p className="text-sm text-gray-500">@{account.handle}</p>}
                      </div>
                    </div>
                    <Switch
                      checked={account.is_active}
                      onCheckedChange={(checked) => updateMutation.mutate({ id: account.id, data: { is_active: checked } })}
                    />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                      <p className="text-lg font-bold text-gray-900">{(account.followers_count || 0).toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Followers</p>
                    </div>
                    <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                      <p className="text-lg font-bold text-gray-900">{stats.posts}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Posts</p>
                    </div>
                    <div className="text-center p-2.5 bg-gray-50 rounded-xl">
                      <p className="text-lg font-bold text-gray-900">{stats.engagement}%</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wide">Engagement</p>
                    </div>
                  </div>

                  <Separator className="mb-4" />
                  <div className="flex items-center justify-between">
                    <Badge className={`border-0 text-xs ${account.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${account.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {account.is_active ? "Connected" : "Paused"}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditAccount({ ...account })}>
                        <Pencil className="w-3.5 h-3.5 text-gray-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-rose-50" onClick={() => deleteMutation.mutate(account.id)}>
                        <Trash2 className="w-3.5 h-3.5 text-gray-400 hover:text-rose-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Connect Social Account</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Platform</label>
              <Select value={form.platform} onValueChange={v => setForm({ ...form, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">📘 Facebook</SelectItem>
                  <SelectItem value="instagram">📸 Instagram</SelectItem>
                  <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                  <SelectItem value="twitter">🐦 Twitter / X</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Account / Page Name</label>
              <Input value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })} placeholder="My Business Page" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Handle / Username</label>
              <Input value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} placeholder="mybusiness" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Followers Count</label>
              <Input type="number" value={form.followers_count} onChange={e => setForm({ ...form, followers_count: e.target.value })} placeholder="e.g. 12500" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
              <Link2 className="w-4 h-4" /> Connect Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editAccount} onOpenChange={() => setEditAccount(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Account</DialogTitle></DialogHeader>
          {editAccount && (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Account Name</label>
                <Input value={editAccount.account_name || ""} onChange={e => setEditAccount({ ...editAccount, account_name: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Handle</label>
                <Input value={editAccount.handle || ""} onChange={e => setEditAccount({ ...editAccount, handle: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Followers Count</label>
                <Input type="number" value={editAccount.followers_count || ""} onChange={e => setEditAccount({ ...editAccount, followers_count: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAccount(null)}>Cancel</Button>
            <Button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-700">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}