import React, { useState } from "react";
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ThumbsUp, Repeat2, Globe } from "lucide-react";
import { format } from "date-fns";

const now = new Date();
const TIMESTAMP = format(now, "MMM d, yyyy 'at' h:mm a");
const SHORT_TIME = "Just now";

const AVATAR_COLORS = [
  "from-indigo-400 to-violet-500",
  "from-pink-400 to-rose-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
];
const AVATAR_INITIALS = "YB"; // Your Brand

function Avatar({ size = "md", gradient = AVATAR_COLORS[0] }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {AVATAR_INITIALS}
    </div>
  );
}

function FacebookPreview({ text, hashtags }) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden max-w-[420px] mx-auto">
      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar gradient={AVATAR_COLORS[0]} />
          <div>
            <p className="text-sm font-semibold text-gray-900">Your Brand Page</p>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <span>{SHORT_TIME}</span>
              <span>·</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
          <MoreHorizontal className="w-5 h-5 text-gray-400 ml-auto" />
        </div>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{text}</p>
        {hashtags?.length > 0 && (
          <p className="text-sm text-blue-600 mt-2">{hashtags.map(h => `#${h.tag}`).join(" ")}</p>
        )}
      </div>
      <div className="bg-gray-50 h-40 flex items-center justify-center text-gray-300 text-xs border-t">
        📸 Image preview
      </div>
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">👍❤️ 124</span>
        <span>18 comments · 7 shares</span>
      </div>
      <div className="px-4 py-1 border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageCircle, label: "Comment" },
          { icon: Share2, label: "Share" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="flex items-center justify-center gap-1.5 py-2.5 text-xs text-gray-500 hover:bg-gray-50 font-medium">
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function InstagramPreview({ text, hashtags }) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden max-w-[380px] mx-auto">
      <div className="flex items-center gap-3 p-3 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-0.5">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
            {AVATAR_INITIALS}
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">yourbrand</p>
          <p className="text-xs text-gray-400">Sponsored</p>
        </div>
        <MoreHorizontal className="w-5 h-5 text-gray-400" />
      </div>
      <div className="bg-gradient-to-br from-indigo-100 to-violet-100 aspect-square flex items-center justify-center">
        <span className="text-5xl">✨</span>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <Heart className="w-6 h-6 text-gray-700" />
            <MessageCircle className="w-6 h-6 text-gray-700" />
            <Share2 className="w-6 h-6 text-gray-700" />
          </div>
          <Bookmark className="w-6 h-6 text-gray-700" />
        </div>
        <p className="text-xs font-semibold text-gray-900">1,284 likes</p>
        <p className="text-xs text-gray-800 line-clamp-3">
          <span className="font-semibold">yourbrand</span> {text}
        </p>
        {hashtags?.length > 0 && (
          <p className="text-xs text-blue-500 line-clamp-2">{hashtags.map(h => `#${h.tag}`).join(" ")}</p>
        )}
        <p className="text-xs text-gray-400 uppercase tracking-wide">{SHORT_TIME}</p>
      </div>
    </div>
  );
}

function LinkedInPreview({ text, hashtags }) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden max-w-[420px] mx-auto">
      <div className="p-4">
        <div className="flex gap-3 mb-3">
          <Avatar gradient={AVATAR_COLORS[3]} />
          <div>
            <p className="text-sm font-semibold text-gray-900">Your Brand</p>
            <p className="text-xs text-gray-500">Digital Marketing Agency · 12,540 followers</p>
            <p className="text-xs text-gray-400">{SHORT_TIME} · <Globe className="inline w-3 h-3" /></p>
          </div>
          <div className="ml-auto">
            <button className="text-xs text-blue-600 font-semibold border border-blue-600 rounded-full px-3 py-1">+ Follow</button>
          </div>
        </div>
        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{text}</p>
        {hashtags?.length > 0 && (
          <p className="text-sm text-blue-600 mt-2">{hashtags.map(h => `#${h.tag}`).join(" ")}</p>
        )}
      </div>
      <div className="bg-gray-50 h-36 flex items-center justify-center text-gray-300 text-xs border-t border-b border-gray-100">
        📸 Image preview
      </div>
      <div className="px-4 py-2 flex items-center gap-4 text-xs text-gray-500 border-b border-gray-100">
        <span>👍 89 reactions</span>
        <span>14 comments</span>
        <span>6 reposts</span>
      </div>
      <div className="px-3 py-1 grid grid-cols-4 divide-x divide-gray-100">
        {[
          { icon: ThumbsUp, label: "Like" },
          { icon: MessageCircle, label: "Comment" },
          { icon: Repeat2, label: "Repost" },
          { icon: Share2, label: "Send" },
        ].map(({ icon: Icon, label }) => (
          <button key={label} className="flex flex-col items-center gap-0.5 py-2 text-[10px] text-gray-500 hover:bg-gray-50 font-medium">
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function TwitterPreview({ text, hashtags }) {
  const maxChars = 280;
  const charCount = text?.length || 0;
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden max-w-[420px] mx-auto">
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar gradient={AVATAR_COLORS[1]} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-bold text-gray-900">Your Brand</p>
              <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91C2.88 9.33 2 10.57 2 12s.88 2.67 2.19 3.34c-.46 1.39-.2 2.9.81 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.67-.88 3.33-2.19c1.4.46 2.91.2 3.92-.81s1.26-2.52.8-3.91c1.32-.67 2.2-1.91 2.2-3.34z"/>
              </svg>
            </div>
            <p className="text-xs text-gray-400">@yourbrand</p>
            <p className="text-sm text-gray-800 mt-2 leading-relaxed whitespace-pre-wrap">
              {text?.slice(0, maxChars)}
              {charCount > maxChars && <span className="text-gray-400">...</span>}
            </p>
            {hashtags?.length > 0 && (
              <p className="text-sm text-blue-500 mt-1">{hashtags.slice(0, 3).map(h => `#${h.tag}`).join(" ")}</p>
            )}
            <div className="flex items-center justify-between mt-3 text-gray-400">
              <span className="text-xs">{SHORT_TIME}</span>
              {charCount > 0 && (
                <span className={`text-xs ${charCount > maxChars ? "text-rose-500" : ""}`}>
                  {charCount}/{maxChars}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-around text-gray-400">
        {[
          { icon: MessageCircle, count: "24" },
          { icon: Repeat2, count: "18" },
          { icon: Heart, count: "142" },
          { icon: Share2, count: null },
        ].map(({ icon: Icon, count }, i) => (
          <button key={i} className="flex items-center gap-1.5 text-xs hover:text-indigo-500 transition-colors">
            <Icon className="w-4 h-4" />
            {count && <span>{count}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function WebPreview({ text, hashtags }) {
  return (
    <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden max-w-[480px] mx-auto">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 h-32 flex items-center justify-center">
        <span className="text-5xl">✨</span>
      </div>
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <Avatar size="sm" gradient={AVATAR_COLORS[0]} />
          <div>
            <p className="text-xs font-semibold text-gray-700">Your Brand</p>
            <p className="text-xs text-gray-400">{TIMESTAMP}</p>
          </div>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Your Post Title Here</h2>
        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{text}</p>
        {hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {hashtags.map(h => (
              <span key={h.tag} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">#{h.tag}</span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-100 text-sm text-gray-500">
          <button className="flex items-center gap-1.5 hover:text-rose-500"><Heart className="w-4 h-4" /> 48</button>
          <button className="flex items-center gap-1.5 hover:text-indigo-500"><MessageCircle className="w-4 h-4" /> 12</button>
          <button className="flex items-center gap-1.5 hover:text-emerald-500"><Share2 className="w-4 h-4" /> Share</button>
        </div>
      </div>
    </div>
  );
}

const PREVIEWS = [
  { key: "facebook", label: "Facebook", emoji: "📘", Component: FacebookPreview },
  { key: "instagram", label: "Instagram", emoji: "📸", Component: InstagramPreview },
  { key: "linkedin", label: "LinkedIn", emoji: "💼", Component: LinkedInPreview },
  { key: "twitter", label: "Twitter / X", emoji: "🐦", Component: TwitterPreview },
  { key: "web", label: "Web", emoji: "🌐", Component: WebPreview },
];

export default function PostPreview({ result, platform, topic }) {
  const [previewPlatform, setPreviewPlatform] = useState(platform || "instagram");

  const hashtags = (result?.hashtags || []).map((tag, i) => ({
    tag,
    score: result?.hashtag_scores?.[i] ?? 50,
  }));

  const current = PREVIEWS.find(p => p.key === previewPlatform) || PREVIEWS[0];
  const { Component } = current;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Preview on Platform</p>
        <div className="flex gap-2 flex-wrap">
          {PREVIEWS.map(p => (
            <button
              key={p.key}
              onClick={() => setPreviewPlatform(p.key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                previewPlatform === p.key
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {p.emoji} {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-auto pb-2">
        <Component text={result?.post_text || ""} hashtags={hashtags} />
      </div>

      <p className="text-xs text-gray-400 text-center">This is a simulated preview — actual appearance may vary.</p>
    </div>
  );
}