import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Copy, Save, Loader2, RefreshCw, Hash, Smile, Type, Eye, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import HashtagSuggestions from "../components/post-generator/HashtagSuggestions";
import PostPreview from "../components/post-generator/PostPreview";

const platforms = [
  { value: "facebook", label: "Facebook", emoji: "📘" },
  { value: "instagram", label: "Instagram", emoji: "📸" },
  { value: "linkedin", label: "LinkedIn", emoji: "💼" },
  { value: "twitter", label: "Twitter / X", emoji: "🐦" },
  { value: "web", label: "Web / Blog", emoji: "🌐" },
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
  const [hashtags, setHashtags] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzingHashtags, setIsAnalyzingHashtags] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const queryClient = useQueryClient();

  const handleGenerate = async () => {
    if (!topic.trim()) return toast.error("Please enter a topic");
    setIsGenerating(true);
    setResult(null);
    setHashtags([]);

    const platformDesc = platform === "web" ? "a blog article / website content" : platform;
    const charLimit = platform === "twitter" ? "max 280 chars" : platform === "web" ? "300-500 words" : "appropriate length";

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a social media content expert. Generate a ${tone} post for ${platformDesc} about: "${topic}".
Return a JSON object with:
- post_text: the main post text (${charLimit} for ${platform})
- hashtags: array of 8-10 relevant hashtags WITHOUT the # symbol
- hashtag_scores: array of numbers 1-100 representing estimated popularity/reach for each hashtag (same order as hashtags)
- caption: a short engaging hook (1-2 sentences)
- emoji_suggestions: array of 5-8 relevant emojis
- title: a short internal title (3-5 words)`,
      response_json_schema: {
        type: "object",
        properties: {
          post_text: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
          hashtag_scores: { type: "array", items: { type: "number" } },
          caption: { type: "string" },
          emoji_suggestions: { type: "array", items: { type: "string" } },
          title: { type: "string" },
        },
      },
    });

    // Merge hashtags with their scores
    const taggedHashtags = (res.hashtags || []).map((tag, i) => ({
      tag,
      score: res.hashtag_scores?.[i] ?? Math.floor(Math.random() * 60 + 30),
    }));

    setResult(res);
    setHashtags(taggedHashtags);

    await base44.entities.GenerationHistory.create({
      type: "text",
      prompt: topic,
      platform,
      tone,
      result: JSON.stringify(res),
    });
    setIsGenerating(false);
    setActiveTab("content");
  };

  const handleSaveAsPost = async () => {
    if (!result) return;
    await base44.entities.Post.create({
      title: result.title,
      content: result.post_text,
      hashtags: hashtags.map(h => `#${h.tag}`).join(" "),
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
    toast.success("Copied!");
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Post Generator</h1>
        <p className="text-gray-500 mt-1">Generate engaging social media content with AI in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <Card className="border-0 shadow-sm lg:col-span-2">
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

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Platform</label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map(p => (
                  <button
                    key={p.value}
                    onClick={() => setPlatform(p.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                      platform === p.value
                        ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    <span>{p.emoji}</span>
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Tone</label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {tones.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.emoji} {t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        <div className="lg:col-span-3 space-y-4">
          {result && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-gray-100 w-full">
                <TabsTrigger value="content" className="flex-1 gap-2"><Type className="w-3.5 h-3.5" /> Content</TabsTrigger>
                <TabsTrigger value="hashtags" className="flex-1 gap-2"><Hash className="w-3.5 h-3.5" /> Hashtags</TabsTrigger>
                <TabsTrigger value="preview" className="flex-1 gap-2"><Eye className="w-3.5 h-3.5" /> Preview</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
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
              ) : activeTab === "content" ? (
                <div className="space-y-5">
                  <div className="relative">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Post Text</label>
                    <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-800 leading-relaxed pr-10">
                      {result.post_text}
                    </div>
                    <button onClick={() => copyToClipboard(result.post_text)} className="absolute top-0 right-0 p-1.5 hover:bg-gray-100 rounded-lg">
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>

                  <div className="relative">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 block">Caption / Hook</label>
                    <div className="p-4 bg-gray-50 rounded-xl text-sm text-gray-800 pr-10">{result.caption}</div>
                    <button onClick={() => copyToClipboard(result.caption)} className="absolute top-0 right-0 p-1.5 hover:bg-gray-100 rounded-lg">
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5 block">
                      <Smile className="w-3 h-3" /> Emoji Suggestions
                    </label>
                    <div className="flex gap-2 text-2xl flex-wrap">
                      {result.emoji_suggestions?.map((emoji, i) => (
                        <span key={i} className="cursor-pointer hover:scale-125 transition-transform" onClick={() => copyToClipboard(emoji)}>
                          {emoji}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-3 border-t">
                    <Button onClick={handleSaveAsPost} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                      <Save className="w-4 h-4 mr-2" /> Save as Draft
                    </Button>
                    <Button variant="outline" onClick={handleGenerate}>
                      <RefreshCw className="w-4 h-4 mr-2" /> Regenerate
                    </Button>
                  </div>
                </div>
              ) : activeTab === "hashtags" ? (
                <HashtagSuggestions hashtags={hashtags} onCopy={copyToClipboard} />
              ) : activeTab === "preview" ? (
                <PostPreview result={result} platform={platform} topic={topic} />
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}