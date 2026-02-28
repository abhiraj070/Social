"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVideos } from "@/lib/use-videos";
import { UploadVideoDialog } from "@/components/upload-video-dialog";

export default function MyContentPage() {
  const { videos, deleteVideo, loading } = useVideos();
  const { toast } = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);

  async function handleDelete(id: string) {
    try {
      await deleteVideo(id);
      toast({ title: "Video deleted" });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Could not delete video",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-balance text-xl font-semibold">My Content</h2>
        <Button onClick={() => setUploadOpen(true)} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {videos.map((v) => (
          <Card key={v.id || v._id} className="overflow-hidden">
            <div className="relative aspect-video">
              <Image
                src={v.thumbnail || "/placeholder.svg"}
                alt={`${v.title} thumbnail`}
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
              />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-1 text-sm">{v.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-end pt-0">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(v.id || v._id || "")}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {!loading && videos.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No videos yet. Upload your first video!
        </p>
      )}

      <UploadVideoDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </div>
  );
}
