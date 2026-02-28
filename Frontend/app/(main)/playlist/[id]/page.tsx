"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import VideoCard from "@/components/video-card";
import { playlistApi } from "@/lib/api";

export default function PlaylistPage() {
  const params = useParams() as { id?: string };
  const playlistId = String(params.id ?? "");
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playlistId) return;
    playlistApi
      .getById(playlistId)
      .then((data: any) => setPlaylist(data))
      .catch(() => setPlaylist(null))
      .finally(() => setLoading(false));
  }, [playlistId]);

  const videos: any[] = playlist?.videos || [];

  return (
    <main className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
      <Card className="h-fit sticky top-4 self-start transition-all">
        <CardHeader>
          <CardTitle>Playlist Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {playlist && (
            <>
              <div className="text-sm font-medium">{playlist.name}</div>
              <div className="text-xs text-muted-foreground">{playlist.description}</div>
              <div className="text-xs text-muted-foreground">{videos.length} videos</div>
            </>
          )}
          {!loading && !playlist && (
            <p className="text-sm text-muted-foreground">Playlist not found.</p>
          )}
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Videos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {videos.map((v: any) => (
            <div
              key={v._id || v.id}
              className="transition-transform hover:-translate-y-0.5"
            >
              <VideoCard
                video={{
                  id: v._id || v.id,
                  title: v.title || "Untitled",
                  creator: v.owner?.fullName || v.owner?.username || "",
                  thumbnail: v.thumbnail || "",
                  avatar: v.owner?.avatar || "",
                  views: v.totalViews ?? v.views ?? 0,
                  uploadDate: v.createdAt,
                }}
              />
            </div>
          ))}
        </div>
        {!loading && videos.length === 0 && (
          <p className="text-sm text-muted-foreground">No videos in this playlist.</p>
        )}
      </section>
    </main>
  );
}
