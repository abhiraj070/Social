"use client";

import { useEffect, useRef, useState } from "react";
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
import { useVideos, type Video } from "@/lib/use-videos";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  video?: Video | null;
};

export function VideoEditDialog({ open, onOpenChange, video }: Props) {
  const { updateVideo } = useVideos();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumb, setThumb] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(video?.title ?? "");
    setDescription(video?.description ?? "");
    setThumb(video?.thumbnail ?? "");
    if (fileRef.current) fileRef.current.value = "";
  }, [video, open]);

  function handleFile(file?: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setThumb(String(reader.result));
    reader.readAsDataURL(file);
  }

  function onSave() {
    if (!video) return;
    if (!title.trim() || !description.trim()) return;

    updateVideo(video.id || video._id, { title, description })
      .then(() => {
        toast({ title: "Saved", description: "Video details updated." });
        onOpenChange(false);
      })
      .catch((err: any) => {
        toast({
          title: "Error",
          description: err?.response?.data?.message || "Could not update video",
          variant: "destructive",
        });
      });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Video</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Thumbnail</Label>
            <Input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {thumb && (
              <img
                src={thumb || "/placeholder.svg"}
                alt="Thumbnail preview"
                className="mt-2 h-28 w-full rounded-md object-cover ring-1 ring-border"
              />
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
