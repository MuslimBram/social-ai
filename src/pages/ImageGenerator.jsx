import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImagePlus, Loader2, Download, Clock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const platformSizes = {
  instagram_post: "1080x1080 square",
  instagram_story: "1080x1920 vertical story",
  facebook_post: "1200x630 landscape",
  twitter_post: "1600x900 landscape banner",
  linkedin_post: "1200x627 professional banner",
};

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [platformSize, setPlatformSize] = useState("instagram_post");
  const [generatedImage, setGeneratedImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: history = [], refetch } = useQuery({
    queryKey: ["gen-history-images"],
    queryFn: () => base44.entities.GenerationHistory.filter({ type: "image" }, "-created_date", 10),
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) return toast.error("Please enter a prompt");
    setIsGenerating(true);
    setGeneratedImage(null);

    const sizeDesc = platformSizes[platformSize];
    const result = await base44.integrations.Core.GenerateImage({
      prompt: `Social media image for ${platformSize.replace("_", " ")}: ${prompt}. Optimized for ${sizeDesc}. Professional, high-quality, vibrant colors, modern design.`,
    });

    setGeneratedImage(result.url);
    await base44.entities.GenerationHistory.create({
      type: "image",
      prompt,
      platform: platformSize.split("_")[0],
      result: result.url,
    });
    refetch();
    setIsGenerating(false);
  };

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Image Creator</h1>
        <p className="text-gray-500 mt-1">Generate stunning social media images with AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ImagePlus className="w-4 h-4 text-violet-500" /> Image Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Describe your image</label>
                <Textarea
                  placeholder="e.g., A minimal flat-lay of coffee and a laptop with morning light..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Platform & Size</label>
                <Select value={platformSize} onValueChange={setPlatformSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram_post">📸 Instagram Post (1080×1080)</SelectItem>
                    <SelectItem value="instagram_story">📱 Instagram Story (1080×1920)</SelectItem>
                    <SelectItem value="facebook_post">📘 Facebook Post (1200×630)</SelectItem>
                    <SelectItem value="twitter_post">🐦 Twitter Banner (1600×900)</SelectItem>
                    <SelectItem value="linkedin_post">💼 LinkedIn Post (1200×627)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-violet-600 hover:bg-violet-700 h-12 text-base"
              >
                {isGenerating ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...</>
                ) : (
                  <><ImagePlus className="w-4 h-4 mr-2" /> Generate Image</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-0 shadow-sm overflow-hidden">
            <CardContent className="p-0">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center h-[400px] bg-gradient-to-br from-violet-50 to-indigo-50">
                  <Loader2 className="w-10 h-10 text-violet-400 animate-spin mb-4" />
                  <p className="text-sm text-gray-500">Creating your image...</p>
                </div>
              ) : generatedImage ? (
                <div>
                  <img src={generatedImage} alt="Generated" className="w-full object-cover" />
                  <div className="p-4 flex gap-3">
                    <Button asChild className="flex-1 bg-violet-600 hover:bg-violet-700">
                      <a href={generatedImage} download target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" /> Download
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50">
                  <ImagePlus className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="text-sm text-gray-400">Your image will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" /> Recent Generations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {history.map(item => (
                    <div
                      key={item.id}
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => setGeneratedImage(item.result)}
                    >
                      <img src={item.result} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}