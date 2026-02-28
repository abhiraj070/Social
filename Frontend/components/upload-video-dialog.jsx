"use client";

import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useVideos } from "@/lib/use-videos";

export function UploadVideoDialog({ open, onOpenChange }) {
  const { addVideo } = useVideos();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbPreview, setThumbPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const thumbRef = useRef(null);
  const videoRef = useRef(null);

  function reset() {
    setTitle("");
    setDescription("");
    setThumbPreview("");
    setProgress(0);
    setUploading(false);
    if (thumbRef.current) thumbRef.current.value = "";
    if (videoRef.current) videoRef.current.value = "";
  }

  function handleThumbPreview(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setThumbPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function onUpload() {
    const videoFile = videoRef.current?.files?.[0];
    const thumbFile = thumbRef.current?.files?.[0];

    if (!title.trim() || !description.trim() || !videoFile || !thumbFile) {
      toast({
        title: "Missing fields",
        description: "Please fill all fields, add a video file and a thumbnail.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("description", description.trim());
      formData.append("videoFile", videoFile);
      formData.append("thumbnail", thumbFile);
      formData.append("duration", "0"); // backend requires duration

      setProgress(40);
      await addVideo(formData);
      setProgress(100);

      toast({
        title: "Uploaded",
        description: "Your video was uploaded successfully.",
      });
      window.dispatchEvent(new CustomEvent("video:uploaded"));
      onOpenChange(false);
      reset();
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Upload failed",
        description: err?.response?.data?.message || err?.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload New Video</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Video Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell viewers about your video"
            />
          </div>
          <div className="grid gap-2">
            <Label>Video File</Label>
            <Input
              ref={videoRef}
              type="file"
              accept="video/*"
            />
          </div>
          <div className="grid gap-2">
            <Label>Thumbnail Upload</Label>
            <Input
              ref={thumbRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleThumbPreview(e.target.files?.[0])}
            />
            {thumbPreview ? (
              <img
                src={thumbPreview || "/placeholder.svg"}
                alt="Thumbnail preview"
                className="mt-2 h-28 w-full rounded-md object-cover ring-1 ring-border"
              />
            ) : (
              <div className="mt-2 h-28 w-full rounded-md bg-muted/50 ring-1 ring-border flex items-center justify-center text-muted-foreground">
                Select an image to preview
              </div>
            )}
          </div>
          {progress > 0 && (
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button onClick={onUpload} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
