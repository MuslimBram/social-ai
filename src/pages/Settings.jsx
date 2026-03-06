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
import { User, Bell, Palette, Shield, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    default_platform: "instagram",
    default_tone: "professional",
    auto_hashtags: true,
    email_notifications: true,
    weekly_report: true,
    auto_schedule: false,
  });

  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u?.preferences) {
        setPreferences(prev => ({ ...prev, ...u.preferences }));
      }
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await base44.auth.updateMe({ preferences });
    toast.success("Settings saved!");
    setSaving(false);
  };

  const initials = user?.full_name?.split(" ").map(n => n[0]).join("").toUpperCase() || "U";

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="bg-gray-100 mb-6">
          <TabsTrigger value="profile" className="gap-2"><User className="w-3.5 h-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2"><Palette className="w-3.5 h-3.5" /> Preferences</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="w-3.5 h-3.5" /> Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-semibold">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900">{user?.full_name || "Loading..."}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input value={user?.full_name || ""} disabled className="mt-1.5 bg-gray-50" />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || ""} disabled className="mt-1.5 bg-gray-50" />
                </div>
              </div>
              <div className="p-4 bg-indigo-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  <p className="text-sm font-medium text-indigo-900">Current Plan</p>
                </div>
                <p className="text-sm text-indigo-700">Free Plan — 1,000 AI credits/month</p>
                <Button variant="outline" size="sm" className="mt-3 border-indigo-200 text-indigo-700 hover:bg-indigo-100">
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Content Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Default Platform</Label>
                  <Select value={preferences.default_platform} onValueChange={v => setPreferences({ ...preferences, default_platform: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter / X</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Default Tone</Label>
                  <Select value={preferences.default_tone} onValueChange={v => setPreferences({ ...preferences, default_tone: v })}>
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="promotional">Promotional</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="inspirational">Inspirational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium">Auto-generate hashtags</p>
                  <p className="text-xs text-gray-500">Automatically add hashtags to generated posts</p>
                </div>
                <Switch checked={preferences.auto_hashtags} onCheckedChange={v => setPreferences({ ...preferences, auto_hashtags: v })} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium">Auto-scheduling</p>
                  <p className="text-xs text-gray-500">Automatically schedule posts at optimal times</p>
                </div>
                <Switch checked={preferences.auto_schedule} onCheckedChange={v => setPreferences({ ...preferences, auto_schedule: v })} />
              </div>
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive email alerts for important events</p>
                </div>
                <Switch checked={preferences.email_notifications} onCheckedChange={v => setPreferences({ ...preferences, email_notifications: v })} />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                <div>
                  <p className="text-sm font-medium">Weekly Performance Report</p>
                  <p className="text-xs text-gray-500">Get a summary of your social media performance</p>
                </div>
                <Switch checked={preferences.weekly_report} onCheckedChange={v => setPreferences({ ...preferences, weekly_report: v })} />
              </div>
              <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}