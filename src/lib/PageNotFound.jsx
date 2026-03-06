import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
        <Sparkles className="w-10 h-10 text-indigo-400" />
      </div>
      <h1 className="text-6xl font-black text-gray-900 mb-3">404</h1>
      <h2 className="text-2xl font-bold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-gray-500 max-w-sm mb-8">
        Looks like this page wandered off the content calendar. Let's get you back on track.
      </p>
      <Button asChild className="bg-indigo-600 hover:bg-indigo-700 gap-2">
        <Link to={createPageUrl("Dashboard")}>
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}