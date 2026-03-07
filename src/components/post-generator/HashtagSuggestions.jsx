import React, { useState } from "react";
import { Copy, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function ScoreBar({ score }) {
  const color =
    score >= 75 ? "bg-emerald-500" :
    score >= 50 ? "bg-amber-400" :
    "bg-rose-400";

  const label =
    score >= 75 ? { text: "High", icon: TrendingUp, color: "text-emerald-600" } :
    score >= 50 ? { text: "Medium", icon: Minus, color: "text-amber-600" } :
    { text: "Niche", icon: TrendingDown, color: "text-rose-600" };

  const LabelIcon = label.icon;

  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
        <div className={`${color} h-1.5 rounded-full transition-all`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-6 text-right">{score}</span>
      <LabelIcon className={`w-3 h-3 ${label.color} flex-shrink-0`} />
    </div>
  );
}

export default function HashtagSuggestions({ hashtags, onCopy }) {
  const [selectedTags, setSelectedTags] = useState(new Set());

  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const copySelected = () => {
    const tags = [...selectedTags].map(t => `#${t}`).join(" ");
    if (!tags) return toast.error("Select at least one hashtag");
    navigator.clipboard.writeText(tags);
    toast.success("Hashtags copied!");
  };

  const copyAll = () => {
    const all = hashtags.map(h => `#${h.tag}`).join(" ");
    navigator.clipboard.writeText(all);
    toast.success("All hashtags copied!");
  };

  const sorted = [...hashtags].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">Hashtag Suggestions</p>
          <p className="text-xs text-gray-500 mt-0.5">Popularity score out of 100 — click to select</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={copySelected} className="gap-1 text-xs">
            <Copy className="w-3 h-3" /> Copy Selected
          </Button>
          <Button size="sm" variant="outline" onClick={copyAll} className="gap-1 text-xs">
            Copy All
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map(({ tag, score }) => {
          const isSelected = selectedTags.has(tag);
          return (
            <div
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? "bg-indigo-50 border-indigo-300"
                  : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
              }`}
            >
              <span className={`text-sm font-medium min-w-[130px] ${isSelected ? "text-indigo-700" : "text-gray-700"}`}>
                #{tag}
              </span>
              <ScoreBar score={score} />
              <button
                onClick={(e) => { e.stopPropagation(); onCopy(`#${tag}`); }}
                className="p-1 hover:bg-white rounded-lg flex-shrink-0"
              >
                <Copy className="w-3 h-3 text-gray-400" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 pt-2 border-t">
        {[
          { color: "bg-emerald-500", label: "High reach (75-100)" },
          { color: "bg-amber-400", label: "Medium reach (50-74)" },
          { color: "bg-rose-400", label: "Niche (0-49)" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className={`w-2 h-2 rounded-full ${l.color}`} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}