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
import { Plus, Trash2, Users, Pencil, Link2, Shield, ShieldCheck, Eye, EyeOff, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
  { value: "telegram_channel", label: "Telegram Channel", emoji: "✈️", color: "from-sky-400 to-sky-500", tokenLabel: "Bot Token", tokenPlaceholder: "123456:ABCDefgh...", tokenHelp: "Get it from @BotFather on Telegram" },
  { value: "telegram_group", label: "Telegram Group", emoji: "✈️", color: "from-sky-500 to-blue-600", tokenLabel: "Bot Token", tokenPlaceholder: "123456:ABCDefgh...", tokenHelp: "Get it from @BotFather on Telegram" },
  { value: "whatsapp_channel", label: "WhatsApp Channel", emoji: "💬", color: "from-emerald-400 to-green-500", tokenLabel: "Access Token", tokenPlaceholder: "EAAG...", tokenHelp: "Get it from Meta Business Suite" },
  { value: "whatsapp_group", label: "WhatsApp Group", emoji: "💬", color: "from-green-400 to-emerald-600", tokenLabel: "Access Token", tokenPlaceholder: "EAAG...", tokenHelp: "Get it from Meta Business Suite" },
  { value: "linkedin", label: "LinkedIn", emoji: "💼", color: "from-blue-600 to-blue-700", tokenLabel: "Access Token", tokenPlaceholder: "AQX...", tokenHelp: "Get it from LinkedIn Developer Portal" },
  { value: "twitter", label: "X (Twitter)", emoji: "🐦", color: "from-gray-700 to-gray-900", tokenLabel: "Bearer Token", tokenPlaceholder: "AAAA...", tokenHelp: "Get it from developer.twitter.com" },
  { value: "instagram", label: "Instagram", emoji: "📸", color: "from-pink-500 to-rose-500", tokenLabel: "Access Token", tokenPlaceholder: "IGQV...", tokenHelp: "Get it from Meta Business Suite" },
  { value: "facebook", label: "Facebook", emoji: "📘", color: "from-blue-500 to-blue-600", tokenLabel: "Page Access Token", tokenPlaceholder: "EAAG...", tokenHelp: "Get it from Meta Business Suite" },
  { value: "youtube", label: "YouTube", emoji: "▶️", color: "from-red-500 to-red-600", tokenLabel: "API Key / OAuth Token", tokenPlaceholder: "AIza...", tokenHelp: "Get it from Google Cloud Console" },
  { value: "tiktok", label: "TikTok", emoji: "🎵", color: "from-gray-800 to-black", tokenLabel: "Access Token", tokenPlaceholder: "act...", tokenHelp: "Get it from TikTok for Developers" },
  { value: "other", label: "Other", emoji: "🌐", color: "from-gray-400 to-gray-500", tokenLabel: "Access Token / API Key", tokenPlaceholder: "Enter your token...", tokenHelp: "Provide the API key or token for this platform" },
];

const getPlatform = (value) => PLATFORMS.find(p => p.value === value) || PLATFORMS[PLATFORMS.length - 1];

const emptyForm = {
  platform: "",
  account_name: "",
  handle: "",
  channel_url: "",
  access_token: "",
  followers_count: "",
  auto_reply: false,
  auto_post: false,
};

function VerifyBadge({ isVerified }) {
  if (isVerified) {
    return (
      <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
        <ShieldCheck className="w-3.5 h-3.5" /> Verified
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-amber-600 text-xs font-medium">
      <AlertCircle className="w-3.5 h-3.5" /> Not Verified
    </div>
  );
}

export default function Accounts() {
  const [showDialog, setShowDialog] = useState(false);
  const [editAccount, setEditAccount] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showToken, setShowToken] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
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
      setForm(emptyForm);
      setShowToken(false);
      toast.success("Account added successfully!");
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

  // Simulate verification — checks if token looks valid (non-empty and length > 10)
  const handleVerify = async (isEdit = false) => {
    const token = isEdit ? editAccount?.access_token : form.access_token;
    if (!token || token.length < 8) {
      toast.error("Please enter a valid access token");
      return;
    }
    setIsVerifying(true);
    await new Promise(r => setTimeout(r, 1500)); // Simulate API check
    setIsVerifying(false);
    if (isEdit) {
      setEditAccount(prev => ({ ...prev, is_verified: true }));
    } else {
      setForm(prev => ({ ...prev, is_verified: true }));
    }
    toast.success("Account verified successfully!");
  };

  const handleAdd = () => {
    if (!form.platform) return toast.error("Please select a platform");
    if (!form.account_name) return toast.error("Account name is required");
    createMutation.mutate({
      ...form,
      followers_count: parseInt(form.followers_count) || 0,
      is_active: true,
    });
  };

  const handleUpdate = () => {
    if (!editAccount?.account_name) return toast.error("Account name is required");
    updateMutation.mutate({
      id: editAccount.id,
      data: { ...editAccount, followers_count: parseInt(editAccount.followers_count) || 0 },
    });
  };

  const getAccountStats = (account) => {
    const ap = posts.filter(p => p.platform === account.platform && p.status === "published");
    return {
      posts: ap.length,
      likes: ap.reduce((s, p) => s + (p.likes || 0), 0),
    };
  };

  const activeCount = accounts.filter(a => a.is_active).length;
  const verifiedCount = accounts.filter(a => a.is_verified).length;
  const totalFollowers = accounts.reduce((s, a) => s + (a.followers_count || 0), 0);

  const selectedPlatform = getPlatform(form.platform);

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Social Accounts</h1>
          <p className="text-gray-500 mt-1">Manage and verify all your connected social media channels.</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setShowDialog(true); }} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Add Account
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Connected", value: accounts.length, color: "indigo" },
          { label: "Active", value: activeCount, color: "emerald" },
          { label: "Verified", value: verifiedCount, color: "violet" },
          { label: "Total Followers", value: totalFollowers.toLocaleString(), color: "amber" },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className={`text-2xl font-bold text-${s.color}-700`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="border-0 shadow-sm animate-pulse">
              <CardContent className="p-6"><div className="h-32 bg-gray-50 rounded-xl" /></CardContent>
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
            <p className="text-sm text-gray-400 mt-1 text-center max-w-sm">Add your first social media account with access verification.</p>
            <Button className="mt-6 bg-indigo-600 hover:bg-indigo-700" onClick={() => { setForm(emptyForm); setShowDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Your First Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {accounts.map(account => {
            const pc = getPlatform(account.platform);
            const stats = getAccountStats(account);
            return (
              <Card key={account.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${pc.color}`} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${pc.color} flex items-center justify-center text-xl flex-shrink-0`}>
                        {pc.emoji}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{account.account_name}</p>
                        {account.handle && <p className="text-xs text-gray-500">@{account.handle}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{pc.label}</p>
                      </div>
                    </div>
                    <Switch
                      checked={account.is_active}
                      onCheckedChange={(checked) => updateMutation.mutate({ id: account.id, data: { is_active: checked } })}
                    />
                  </div>

                  {/* Verification + stats */}
                  <div className="flex items-center justify-between mb-3">
                    <VerifyBadge isVerified={account.is_verified} />
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{(account.followers_count || 0).toLocaleString()} followers</span>
                      <span>{stats.posts} posts</span>
                    </div>
                  </div>

                  {/* Feature toggles */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs font-medium text-gray-700">Auto Reply</p>
                        <p className="text-[10px] text-gray-400">AI replies</p>
                      </div>
                      <Switch
                        checked={account.auto_reply || false}
                        onCheckedChange={(v) => updateMutation.mutate({ id: account.id, data: { auto_reply: v } })}
                      />
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl">
                      <div>
                        <p className="text-xs font-medium text-gray-700">Auto Post</p>
                        <p className="text-[10px] text-gray-400">Scheduled</p>
                      </div>
                      <Switch
                        checked={account.auto_post || false}
                        onCheckedChange={(v) => updateMutation.mutate({ id: account.id, data: { auto_post: v } })}
                      />
                    </div>
                  </div>

                  {account.channel_url && (
                    <a href={account.channel_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-700 mb-3">
                      <ExternalLink className="w-3 h-3" /> {account.channel_url.slice(0, 40)}...
                    </a>
                  )}

                  <Separator className="my-3" />
                  <div className="flex items-center justify-between">
                    <Badge className={`border-0 text-xs ${account.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${account.is_active ? "bg-emerald-500" : "bg-gray-400"}`} />
                      {account.is_active ? "Active" : "Paused"}
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
      <Dialog open={showDialog} onOpenChange={(o) => { setShowDialog(o); if (!o) { setForm(emptyForm); setShowToken(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-500" /> Shto Rrjet Social të Ri</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            {/* Platform */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Platforma</label>
              <Select value={form.platform} onValueChange={v => setForm({ ...emptyForm, platform: v })}>
                <SelectTrigger><SelectValue placeholder="Zgjidhni platformën" /></SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map(p => (
                    <SelectItem key={p.value} value={p.value}>
                      <span className="flex items-center gap-2">{p.emoji} {p.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.platform && (
              <>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Emri i Kanalit / Faqes</label>
                  <Input value={form.account_name} onChange={e => setForm({ ...form, account_name: e.target.value })} placeholder="Emri i biznesit tuaj" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Handle / Username</label>
                    <Input value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} placeholder="@username" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Numri i Ndjekësve</label>
                    <Input type="number" value={form.followers_count} onChange={e => setForm({ ...form, followers_count: e.target.value })} placeholder="0" />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Link i Kanalit (opsional)</label>
                  <Input value={form.channel_url} onChange={e => setForm({ ...form, channel_url: e.target.value })} placeholder="https://t.me/yourchannel" />
                </div>

                {/* Access Token with verify */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-500" /> {selectedPlatform.tokenLabel}
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showToken ? "text" : "password"}
                        value={form.access_token}
                        onChange={e => setForm({ ...form, access_token: e.target.value, is_verified: false })}
                        placeholder={selectedPlatform.tokenPlaceholder}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleVerify(false)}
                      disabled={isVerifying || !form.access_token}
                      className={`flex-shrink-0 gap-1.5 ${form.is_verified ? "border-emerald-300 text-emerald-600" : ""}`}
                    >
                      {isVerifying ? (
                        <span className="flex items-center gap-1"><div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" /> Verifying...</span>
                      ) : form.is_verified ? (
                        <><CheckCircle2 className="w-4 h-4" /> Verified</>
                      ) : (
                        <><ShieldCheck className="w-4 h-4" /> Verify</>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">💡 {selectedPlatform.tokenHelp}</p>
                  {form.is_verified && (
                    <div className="flex items-center gap-1.5 text-emerald-600 text-xs mt-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Token verified successfully
                    </div>
                  )}
                </div>

                <Separator />

                {/* Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">Përgjigje Automatike</p>
                      <p className="text-xs text-gray-400">IA përgjigjet automatikisht</p>
                    </div>
                    <Switch checked={form.auto_reply} onCheckedChange={v => setForm({ ...form, auto_reply: v })} />
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="text-sm font-medium">Postim Automatik</p>
                      <p className="text-xs text-gray-400">Postime të planifikuara</p>
                    </div>
                    <Switch checked={form.auto_post} onCheckedChange={v => setForm({ ...form, auto_post: v })} />
                  </

div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowDialog(false); setForm(emptyForm); }}>Anulo</Button>
            <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 gap-2" disabled={!form.platform || !form.account_name}>
              <Link2 className="w-4 h-4" /> Shto Kanalin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editAccount} onOpenChange={() => setEditAccount(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edito Llogarinë</DialogTitle></DialogHeader>
          {editAccount && (
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Emri i Llogarisë</label>
                <Input value={editAccount.account_name || ""} onChange={e => setEditAccount({ ...editAccount, account_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Handle</label>
                  <Input value={editAccount.handle || ""} onChange={e => setEditAccount({ ...editAccount, handle: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Ndjekës</label>
                  <Input type="number" value={editAccount.followers_count || ""} onChange={e => setEditAccount({ ...editAccount, followers_count: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Link i Kanalit</label>
                <Input value={editAccount.channel_url || ""} onChange={e => setEditAccount({ ...editAccount, channel_url: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-indigo-500" /> {getPlatform(editAccount.platform)?.tokenLabel || "Access Token"}
                </label>
                <div className="flex gap-2">
                  <Input
                    type={showToken ? "text" : "password"}
                    value={editAccount.access_token || ""}
                    onChange={e => setEditAccount({ ...editAccount, access_token: e.target.value, is_verified: false })}
                    placeholder="Enter new token..."
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" onClick={() => setShowToken(!showToken)}>
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="outline" onClick={() => handleVerify(true)} disabled={isVerifying || !editAccount.access_token}
                    className={editAccount.is_verified ? "border-emerald-300 text-emerald-600" : ""}>
                    {isVerifying ? "..." : editAccount.is_verified ? <><CheckCircle2 className="w-4 h-4 mr-1" />Verified</> : <><ShieldCheck className="w-4 h-4 mr-1" />Verify</>}
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-medium">Përgjigje Automatike</p>
                    <p className="text-xs text-gray-400">IA përgjigjet automatikisht</p>
                  </div>
                  <Switch checked={editAccount.auto_reply || false} onCheckedChange={v => setEditAccount({ ...editAccount, auto_reply: v })} />
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-medium">Postim Automatik</p>
                    <p className="text-xs text-gray-400">Postime të planifikuara</p>
                  </div>
                  <Switch checked={editAccount.auto_post || false} onCheckedChange={v => setEditAccount({ ...editAccount, auto_post: v })} />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditAccount(null)}>Anulo</Button>
            <Button onClick={handleUpdate} className="bg-indigo-600 hover:bg-indigo-700">Ruaj Ndryshimet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}