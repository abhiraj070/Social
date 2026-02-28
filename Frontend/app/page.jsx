"use client";

import AppShell from "@/components/app-shell";
import { VideoCard } from "@/components/video-card";
import { useState, useEffect } from "react";
import { DashboardActions } from "@/components/dashboard-actions";
import { UploadVideoDialog } from "@/components/upload-video-dialog";
import api from "@/lib/api";

export default function Page() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function fetchVideos() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/video/publish-video");
      setVideos(Array.isArray(res.data.data) ? res.data.data : []);
    } catch (err) {
      console.warn("Could not fetch videos:", err?.message);
      setError("Could not load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVideos();
    const handler = () => fetchVideos();
    window.addEventListener("video:uploaded", handler);
    return () => window.removeEventListener("video:uploaded", handler);
  }, []);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl space-y-6 p-4 md:p-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-balance text-2xl font-semibold md:text-3xl">
              All Videos
            </h1>
            <p className="text-sm text-muted-foreground">
              Browse your uploaded content
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DashboardActions onQuickUpload={() => setUploadOpen(true)} />
          </div>
        </header>

        {loading && (
          <p className="text-sm text-muted-foreground">Loading videos…</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => (
            <VideoCard
              key={v._id || v.id}
              video={{
                id: v._id || v.id,
                title: v.title,
                creator: v.owner?.fullName || v.owner?.username || "Unknown",
                thumbnail: v.thumbnail || "",
                avatar: v.owner?.avatar || "",
                views: v.totalViews ?? v.views ?? 0,
                uploadDate: v.createdAt,
              }}
            />
          ))}
          {!loading && videos.length === 0 && !error && (
            <p className="col-span-full text-sm text-muted-foreground">
              No videos yet. Upload your first video!
            </p>
          )}
        </section>

        <UploadVideoDialog open={uploadOpen} onOpenChange={setUploadOpen} />
      </div>
    </AppShell>
  );
}
