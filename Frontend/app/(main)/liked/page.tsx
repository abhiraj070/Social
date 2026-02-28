"use client";

import { useEffect, useState } from "react";
import { VideoCard } from "@/components/video-card";
import { likeApi } from "@/lib/api";

export default function LikedPage() {
  const [likedVideos, setLikedVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    likeApi
      .getLikedVideos()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : [];
        setLikedVideos(list);
      })
      .catch(() => setLikedVideos([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-balance text-xl font-semibold">Liked Videos</h2>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {likedVideos.map((like: any) => {
          const v = like.video || like;
          return (
            <VideoCard
              key={like._id || v._id}
              video={{
                id: v._id || v.id,
                title: v.title || "Untitled",
                creator: v.owner?.fullName || v.owner?.username || "Unknown",
                thumbnail: v.thumbnail || "",
                avatar: v.owner?.avatar || "",
                views: v.totalViews ?? v.views ?? 0,
                uploadDate: v.createdAt,
              }}
            />
          );
        })}
      </div>
      {!loading && likedVideos.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No liked videos yet. Start liking some!
        </p>
      )}
    </div>
  );
}
