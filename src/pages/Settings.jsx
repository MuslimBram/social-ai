import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User, Bell, Palette, Shield, Save, Loader2, Check, Zap, Crown,
  Key, Copy, RefreshCw, CreditCard, Star, Users, Lock
} from "lucide-react";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/month",
    icon: Star,
    color: "gray",
    features: ["1,000 AI credits/month", "3 social accounts", "Basic analytics", "5 templates", "Email support"],
    cta: "Current Plan",
    current: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/month",
    icon: Zap,
    color: "indigo",
    features: ["10,000 AI credits/month", "10 social accounts", "Advanced analytics", "Unlimited templates", "Bulk generator", "Priority support", "API access"],
    cta: "Upgrade to Pro",
    current: false,
    popular: true,
  },
  {
    id: "agency",
    name: "Agency",
    price: "$99",
    period: "/month",
    icon: Crown,
    color: "amber",
    features: ["Unlimited AI credits", "Unlimited accounts", "White-label dashboard", "Team management (10 seats)", "Custom integrations", "Dedicated support", "SLA guarantee"],
    cta: "Upgrade to Agency",
    current: false,
  },
];

export default function Settings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState("sk-sai-••••••••••••••••••••••••");
  const [showApiKey, setShowApiKey] = useState(false);
  const [preferences, setPreferences] = useState({
    default_platform: "instagram",
    default_tone: "professional",
    auto_hashtags: true,
    email_notifications: true,
    weekly_report: true,
    auto_schedule: false,
    post_approval: true,
    language: "en",
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.preferences) setPreferences(prev => ({ ...prev, ...u.preferences }));
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ preferences });
    toast.success("Settings saved!");
    setSaving(false);
  };

  const regenerateApiKey = () => {
    const newKey = "sk-sai-" + Math.random().toString(36).substring(2, 30);
    setApiKey(newKey);
    setShowApiKey(true);
    toast.success("New API key generated!");
  };

  const copyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success("API key copied!");
  };

  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  const SaveButton = ({ label = "Save Changes" }) => (
    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
      {label}
    </Button>
  );

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account, preferences, and subscription.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-gray-100 mb-6 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="profile" className="gap-1.5 text-xs sm:text-sm"><User className="w-3.5 h-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 text-xs sm:text-sm"><Palette className="w-3.5 h-3.5" />Preferences</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs sm:text-sm"><Bell className="w-3.5 h-3.5" />Notifications</TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 text-xs sm:text-sm"><CreditCard className="w-3.5 h-3.5" />Billing</TabsTrigger>
          <TabsTrigger value="api" className="gap-1.5 text-xs sm:text-sm"><Key className="w-3.5 h-3.5" />API</TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs sm:text-sm"><Users className="w-3.5 h-3.5" />Team</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-5">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-2xl font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold text-gray-900">{user?.full_name || "Loading..."}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <Badge className="mt-2 bg-indigo-100 text-indigo-700 border-0 text-xs">
                    {user?.role === "admin" ? "Admin" : "Free Plan"}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={user?.full_name || ""} disabled className="mt-1.5 bg-gray-50" />
                </div>
                <div>
                  <Label>Email Address</Label>
                  <Input value={user?.email || ""} disabled className="mt-1.5 bg-gray-50" />
                </div>
                <div>
                  <Label>Language</Label>
                  <Select value={preferences.language || "en"} onValueChange={v => setPreferences({ ...preferences, language: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="fr">🇫🇷 French</SelectItem>
                      <SelectItem value="de">🇩🇪 German</SelectItem>
                      <SelectItem value="pt">🇧🇷 Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SaveButton label="Save Profile" />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm border-rose-100 bg-rose-50/30">
            <CardHeader><CardTitle className="text-base text-rose-700">Danger Zone</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-rose-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">Delete Account</p>
                  <p className="text-xs text-gray-500">Permanently delete your account and all data. This cannot be undone.</p>
                </div>
                <Button variant="outline" size="sm" className="border-rose-200 text-rose-600 hover:bg-rose-50">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Content Defaults</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Default Platform</Label>
                  <Select value={preferences.default_platform} onValueChange={v => setPreferences({ ...preferences, default_platform: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">📘 Facebook</SelectItem>
                      <SelectItem value="instagram">📸 Instagram</SelectItem>
                      <SelectItem value="linkedin">💼 LinkedIn</SelectItem>
                      <SelectItem value="twitter">🐦 Twitter / X</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Tone</Label>
                  <Select value={preferences.default_tone} onValueChange={v => setPreferences({ ...preferences, default_tone: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">👔 Professional</SelectItem>
                      <SelectItem value="friendly">😊 Friendly</SelectItem>
                      <SelectItem value="promotional">📢 Promotional</SelectItem>
                      <SelectItem value="humorous">😄 Humorous</SelectItem>
                      <SelectItem value="inspirational">✨ Inspirational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              {[
                { key: "auto_hashtags", label: "Auto-generate hashtags", desc: "Automatically add hashtags to all generated posts" },
                { key: "auto_schedule", label: "Auto-scheduling", desc: "Schedule posts automatically at optimal times" },
                { key: "post_approval", label: "Require post approval", desc: "Review AI-generated posts before scheduling" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <Switch checked={preferences[item.key]} onCheckedChange={v => setPreferences({ ...preferences, [item.key]: v })} />
                </div>
              ))}
              <SaveButton />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Email Notifications</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { key: "email_notifications", label: "Post Published", desc: "Get notified when a scheduled post goes live" },
                { key: "weekly_report", label: "Weekly Performance Report", desc: "Receive a summary of your social media performance every Monday" },
                { key: "auto_schedule", label: "Automation Activity", desc: "Get alerts when automation workflows run" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <Switch checked={preferences[item.key]} onCheckedChange={v => setPreferences({ ...preferences, [item.key]: v })} />
                </div>
              ))}
              <SaveButton />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          {/* Current Usage */}
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Current Usage</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-indigo-50 rounded-xl">
                  <p className="text-xs text-indigo-500 uppercase tracking-wide font-medium">AI Credits</p>
                  <p className="text-2xl font-bold text-indigo-900 mt-1">650</p>
                  <p className="text-xs text-indigo-600 mt-1">of 1,000 used</p>
                  <div className="w-full bg-indigo-200 rounded-full h-1.5 mt-2">
                    <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>
                <div className="p-4 bg-amber-50 rounded-xl">
                  <p className="text-xs text-amber-500 uppercase tracking-wide font-medium">Accounts</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">4</p>
                  <p className="text-xs text-amber-600 mt-1">of 3 limit (upgrade)</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl">
                  <p className="text-xs text-emerald-500 uppercase tracking-wide font-medium">Posts This Month</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">47</p>
                  <p className="text-xs text-emerald-600 mt-1">unlimited on Free</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">Credits reset on April 1, 2026</p>
            </CardContent>
          </Card>

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map(plan => {
              const Icon = plan.icon;
              const colorMap = {
                gray: { bg: "bg-gray-50", icon: "text-gray-500", badge: "bg-gray-100 text-gray-700", border: "border-gray-200" },
                indigo: { bg: "bg-indigo-50", icon: "text-indigo-600", badge: "bg-indigo-600 text-white", border: "border-indigo-300" },
                amber: { bg: "bg-amber-50", icon: "text-amber-600", badge: "bg-amber-100 text-amber-700", border: "border-amber-200" },
              };
              const c = colorMap[plan.color];
              return (
                <Card key={plan.id} className={`border-0 shadow-sm relative overflow-hidden ${plan.popular ? "ring-2 ring-indigo-500" : ""}`}>
                  {plan.popular && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-indigo-600 text-white text-[10px]">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${c.icon}`} />
                    </div>
                    <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                    <div className="flex items-end gap-1 mt-1 mb-4">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-sm text-gray-500 mb-1">{plan.period}</span>
                    </div>
                    <ul className="space-y-2 flex-1 mb-5">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.current ? "outline" : "default"}
                      disabled={plan.current}
                      className={`w-full ${!plan.current && plan.color === "indigo" ? "bg-indigo-600 hover:bg-indigo-700" : ""} ${!plan.current && plan.color === "amber" ? "bg-amber-500 hover:bg-amber-600" : ""}`}
                    >
                      {plan.current ? <><Check className="w-4 h-4 mr-2" />Current Plan</> : plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">API Access</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <Lock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Pro Plan Required</p>
                  <p className="text-xs text-amber-700 mt-0.5">API access is available on Pro and Agency plans. Upgrade to unlock full API capabilities.</p>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Your API Key</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      value={showApiKey ? apiKey : "sk-sai-••••••••••••••••••••••••"}
                      readOnly
                      className="font-mono text-sm pr-10"
                    />
                  </div>
                  <Button variant="outline" size="icon" onClick={copyApiKey}><Copy className="w-4 h-4" /></Button>
                  <Button variant="outline" size="icon" onClick={regenerateApiKey}><RefreshCw className="w-4 h-4" /></Button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Keep this key secure. Do not share it publicly.</p>
              </div>
              <div>
                <Label className="mb-2 block">API Endpoints</Label>
                <div className="space-y-2">
                  {[
                    { method: "POST", path: "/api/v1/generate/post", desc: "Generate a social media post" },
                    { method: "POST", path: "/api/v1/generate/image", desc: "Generate an image" },
                    { method: "GET", path: "/api/v1/posts", desc: "List all posts" },
                    { method: "POST", path: "/api/v1/schedule", desc: "Schedule a post" },
                  ].map(ep => (
                    <div key={ep.path} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl font-mono text-xs">
                      <Badge className={`flex-shrink-0 ${ep.method === "GET" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"} border-0 text-[10px]`}>
                        {ep.method}
                      </Badge>
                      <span className="text-gray-600 flex-1">{ep.path}</span>
                      <span className="text-gray-400 font-sans hidden sm:block">{ep.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Team Members</CardTitle>
                <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">Agency Plan Only</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <Crown className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-900">Upgrade to Agency</p>
                  <p className="text-xs text-amber-700 mt-0.5">Team management is available on the Agency plan. Add up to 10 team members and control their access.</p>
                  <Button size="sm" className="mt-3 bg-amber-500 hover:bg-amber-600 text-white">Upgrade to Agency</Button>
                </div>
              </div>

              {/* Preview of team management UI */}
              <div className="opacity-50 pointer-events-none">
                <div className="space-y-3">
                  {[
                    { name: "You (Admin)", email: user?.email || "you@company.com", role: "Owner" },
                    { name: "Sarah Johnson", email: "sarah@company.com", role: "Editor" },
                    { name: "Mike Chen", email: "mike@company.com", role: "Viewer" },
                  ].map(m => (
                    <div key={m.email} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
                      <Avatar className="w-9 h-9">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                          {m.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-xs text-gray-500 truncate">{m.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{m.role}</Badge>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="outline" className="mt-3 gap-2">
                  <Users className="w-4 h-4" /> Invite Team Member
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}