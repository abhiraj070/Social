// file: /lib/use-videos.ts
"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { videoApi } from "@/lib/api"
import api from "@/lib/api"

export type Video = {
  id: string
  _id?: string
  title: string
  description?: string
  thumbnail?: string
  channelName: string
  channelAvatar?: string
  views: number
  duration?: string
  published: boolean
  createdAt: string // ISO date string
  owner?: any
  totalLikes?: number
  totalViews?: number
}

/** Map a backend video doc to our local Video shape */
function mapVideo(v: any): Video {
  return {
    id: v._id || v.id,
    _id: v._id || v.id,
    title: v.title || "Untitled",
    description: v.description || "",
    thumbnail: v.thumbnail || "",
    channelName: v.owner?.fullName || v.owner?.username || "My Channel",
    channelAvatar: v.owner?.avatar || "",
    views: v.totalViews ?? v.views ?? 0,
    duration: v.duration ? String(v.duration) : undefined,
    published: v.isPublished ?? v.published ?? true,
    createdAt: v.createdAt || new Date().toISOString(),
    owner: v.owner,
    totalLikes: v.totalLikes ?? 0,
    totalViews: v.totalViews ?? 0,
  }
}

export function useVideos() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  const fetchVideos = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get("/video/publish-video")
      const list = Array.isArray(res.data.data) ? res.data.data : []
      setVideos(list.map(mapVideo))
    } catch {
      console.warn("useVideos: could not fetch videos")
      setVideos([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos()
    const handler = () => fetchVideos()
    window.addEventListener("video:uploaded", handler)
    window.addEventListener("videos:changed", handler)
    return () => {
      window.removeEventListener("video:uploaded", handler)
      window.removeEventListener("videos:changed", handler)
    }
  }, [fetchVideos])

  const stats = useMemo(() => {
    const totalViews = videos.reduce((acc, v) => acc + (v.totalViews ?? v.views ?? 0), 0)
    const totalLikes = videos.reduce((acc, v) => acc + (v.totalLikes ?? 0), 0)
    const subscribers = 0 // fetched separately via subscription API
    return { totalViews, totalLikes, subscribers }
  }, [videos])

  async function addVideo(formData: FormData) {
    const data = await videoApi.publish(formData)
    window.dispatchEvent(new CustomEvent("videos:changed"))
    return data
  }

  async function updateVideo(id: string, patch: Record<string, unknown>) {
    const data = await videoApi.update(id, patch)
    window.dispatchEvent(new CustomEvent("videos:changed"))
    return data
  }

  async function deleteVideo(id: string) {
    await videoApi.delete(id)
    window.dispatchEvent(new CustomEvent("videos:changed"))
  }

  async function togglePublished(id: string) {
    await videoApi.togglePublish(id)
    window.dispatchEvent(new CustomEvent("videos:changed"))
  }

  return { videos, stats, loading, addVideo, updateVideo, deleteVideo, togglePublished, refetch: fetchVideos }
}
