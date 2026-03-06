import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Copy, Save, Loader2, RefreshCw, Hash, Smile, Type } from "lucide-react";
import { toast } from "sonner";

const platforms = [
  { value: "facebook", label: "Facebook", emoji: "📘" },
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "linkedin", label: "LinkedIn", emoji: "💼" },
  { value: "twitter", label: "Twitter / X", emoji: "🐦" },
];

const tones = [
  { value: "professional", label: "Professional", emoji: "👔" },
  { value: "friendly", label: "Friendly", emoji: "😊" },
  { value: "promotional", label: "Promotional", emoji: "📢" },
  { value: "humorous", label: "Humorous", emoji: "😄" },
  { value: "inspirational", label: "Inspirational", emoji: "✨" },
];

export default function PostGenerator() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("professional");
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error("Please enter a topic");
    setIsGenerating(true);
    setResult(null);

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a social media content expert. Generate a ${tone} social media post for ${platform} about: "${topic}".

Return a JSON object with:
- post_text: the main post text (appropriate length for ${platform}, max 280 chars for twitter)
- hashtags: an array of 5-8 relevant hashtags without the # symbol
- caption: a short engaging caption or hook (1-2 sentences)
- emoji_suggestions: an array of 5-8 relevant emojis
- title: a short internal title for this post (3-5 words)`,
      response_json_schema: {
        type: "object",
        properties: {
          post_text: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          caption: { type: "string" },
          emoji_suggestions: { type: "array", items: { type: "string" } },
          title: { type: "string" },
        },
      },
    });

    setResult(res);
    await base44.entities.GenerationHistory.create({
      type: "text",
      prompt: topic,
      platform,
      tone,
      result: JSON.stringify(res),
    });
    setIsGenerating(false);
  };

  const handleSaveAsPost = async () => {
    if (!result) return;
    await base44.entities.Post.create({
      title: result.title,
      content: result.post_text,
      hashtags: result.hashtags?.map(h => `#${h}`).join(" "),
      caption: result.caption,
      emoji_suggestions: result.emoji_suggestions?.join(" "),
      platform,
      tone,
      status: "draft",
      topic,
    });
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    toast.success("Post saved as draft!");
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Post Generator</h1>
        <p className="text-gray-500 mt-1">Generate engaging social media content with AI in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Configure Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Topic or Product</label>
              <Textarea
                placeholder="e.g., Launch of our new eco-friendly water bottle..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Platform</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map(p => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.emoji} {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(t => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.emoji} {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
            >
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" /> Generate Post</>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Result Panel */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4 animate-pulse">
                  <Sparkles className="w-7 h-7 text-indigo-500" />
                </div>
                <p className="text-sm text-gray-500">AI is crafting your post...</p>
              </div>
            ) : !result ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                  <Type className="w-7 h-7 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Your generated content will appear here</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Post Text */}
                <div className="relative">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Post Text</label>
                  <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-800 leading-relaxed">
                    {result.post_text}
                  </div>
                  <button onClick={() => copyToClipboard(result.post_text)} className="absolute top-0 right-0 p-1.5 hover:bg-gray-100 rounded-lg">
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Caption */}
                <div className="relative">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Caption</label>
                  <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-800">{result.caption}</div>
                  <button onClick={() => copyToClipboard(result.caption)} className="absolute top-0 right-0 p-1.5 hover:bg-gray-100 rounded-lg">
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Hashtags */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 block">
                    <Hash className="w-3 h-3" /> Hashtags
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {result.hashtags?.map((tag, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                        onClick={() => copyToClipboard(`#${tag}`)}
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Emojis */}
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 block">
                    <Smile className="w-3 h-3" /> Emoji Suggestions
                  </label>
                  <div className="flex gap-2 text-2xl">
                    {result.emoji_suggestions?.map((emoji, i) => (
                      <span key={i} className="cursor-pointer hover:scale-125 transition-transform" onClick={() => copyToClipboard(emoji)}>
                        {emoji}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-3 border-t">
                  <Button onClick={handleSaveAsPost} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    <Save className="w-4 h-4 mr-2" /> Save as Draft
                  </Button>
                  <Button variant="outline" onClick={handleGenerate}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}