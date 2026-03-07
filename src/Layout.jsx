import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import {
  LayoutDashboard,
  Sparkles,
  ImagePlus,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Zap,
  FileText,
  LayoutTemplate,
  History,
  Bot,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navGroups = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
      { name: "Analytics", icon: BarChart3, page: "Analytics" },
    ],
  },
  {
    label: "Create",
    items: [
      { name: "AI Generator", icon: Sparkles, page: "PostGenerator" },
      { name: "Image Creator", icon: ImagePlus, page: "ImageGenerator" },
      { name: "Templates", icon: LayoutTemplate, page: "Templates" },
      { name: "History", icon: History, page: "GenerationHistory" },
    ],
  },
  {
    label: "Manage",
    items: [
      { name: "Posts", icon: FileText, page: "PostsManager" },
      { name: "Calendar", icon: CalendarDays, page: "ContentCalendar" },
      { name: "Automation", icon: Bot, page: "Automation" },
      { name: "Accounts", icon: Users, page: "Accounts" },
      { name: "Competitors", icon: Target, page: "CompetitorAnalysis" },
    ],
  },
  {
    label: "Account",
    items: [
      { name: "Settings", icon: Settings, page: "Settings" },
    ],
  },
];

const navItems = navGroups.flatMap(g => g.items);

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const initials = user?.full_name
    ? user.full_name.split(" ").map(n => n[0]).join("").toUpperCase()
    : "U";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <style>{`
        :root {
          --sidebar-bg: linear-gradient(180deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%);
        }
        .sidebar-gradient {
          background: var(--sidebar-bg);
        }
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 sidebar-gradient text-white 
          transform transition-transform duration-300 ease-in-out flex flex-col
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Zap className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">SocialAI</h1>
            <p className="text-[10px] text-indigo-300 uppercase tracking-widest">Generator</p>
          </div>
          <button
            className="lg:hidden ml-auto p-1 hover:bg-white/10 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest px-4 mb-1.5">{group.label}</p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = currentPageName === item.page;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                        ${isActive
                          ? "bg-white/20 text-white shadow-lg shadow-indigo-900/30"
                          : "text-indigo-200 hover:bg-white/10 hover:text-white"
                        }`}
                    >
                      <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-amber-300" : ""}`} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 mx-3 mb-4 rounded-xl bg-white/10 backdrop-blur-sm">
          <p className="text-xs text-indigo-200 mb-2">AI Credits</p>
          <div className="w-full bg-white/20 rounded-full h-2 mb-2">
            <div className="bg-amber-400 h-2 rounded-full" style={{ width: "65%" }} />
          </div>
          <p className="text-[11px] text-indigo-300">650 / 1,000 used this month</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-8 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {navItems.find(i => i.page === currentPageName)?.name || (currentPageName === "CompetitorAnalysis" ? "Competitor Analysis" : currentPageName)}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button asChild size="sm" className="hidden sm:flex bg-indigo-600 hover:bg-indigo-700 h-8 text-xs gap-1.5">
              <Link to={createPageUrl("PostGenerator")}>
                <Sparkles className="w-3.5 h-3.5" /> Generate
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {user?.full_name || "User"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={createPageUrl("Settings")}>
                    <Settings className="w-4 h-4 mr-2" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => base44.auth.logout()}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}