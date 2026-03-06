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
import { Plus, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import PlatformIcon from "../components/shared/PlatformIcon";

export default function Accounts() {
  const [showDialog, setShowDialog] = useState(false);
  const [form, setForm] = useState({ platform: "instagram", account_name: "", handle: "" });
  const queryClient = useQueryClient();

  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => base44.entities.SocialAccount.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.SocialAccount.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setShowDialog(false);
      setForm({ platform: "instagram", account_name: "", handle: "" });
      toast.success("Account added!");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SocialAccount.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["accounts"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.SocialAccount.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      toast.success("Account removed");
    },
  });

  const handleAdd = () => {
    if (!form.account_name) return toast.error("Account name is required");
    createMutation.mutate({ ...form, is_active: true, followers_count: 0 });
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Accounts</h1>
          <p className="text-gray-500 mt-1">Manage your connected social media accounts.</p>
        </div>
        <Button onClick={() => setShowDialog(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Add Account
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="border-0 shadow-sm animate-pulse">
              <CardContent className="p-6"><div className="h-20 bg-gray-50 rounded-xl" /></CardContent>
            </Card>
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Users className="w-12 h-12 text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No accounts connected</p>
            <p className="text-sm text-gray-400 mt-1">Add your first social media account to get started.</p>
            <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700" onClick={() => setShowDialog(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accounts.map(account => (
            <Card key={account.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <PlatformIcon platform={account.platform} size="lg" />
                    <div>
                      <p className="font-semibold text-gray-900">{account.account_name}</p>
                      {account.handle && <p className="text-sm text-gray-500">@{account.handle}</p>}
                      <p className="text-xs text-gray-400 mt-1">{account.followers_count?.toLocaleString()} followers</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={account.is_active}
                      onCheckedChange={(checked) => updateMutation.mutate({ id: account.id, data: { is_active: checked } })}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <Badge variant={account.is_active ? "default" : "secondary"} className={account.is_active ? "bg-emerald-100 text-emerald-700 border-0" : ""}>
                    {account.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-rose-500" onClick={() => deleteMutation.mutate(account.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Social Account</DialogTitle>
          </DialogHeader>
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
              <label className="text-sm font-medium mb-1.5 block">Account Name</label>
              <Input value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })} placeholder="My Business Page" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Handle / Username</label>
              <Input value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} placeholder="mybusiness" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700">Add Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}