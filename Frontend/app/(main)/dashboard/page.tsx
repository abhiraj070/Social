"use client"

import { useMemo, useState } from "react"
import { AnalyticsCards } from "@/components/analytics-cards"
import { useVideos ,type Video } from "@/lib/use-videos"
import { useToast } from "@/hooks/use-toast"
import { VideoEditDialog } from "@/components/video-edit-dialog"
import { ConfirmBar } from "@/components/confirm-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

export default function DashboardPage() {
  const { videos, togglePublished, deleteVideo } = useVideos()
  const { toast } = useToast()

  const [editOpen, setEditOpen] = useState(false)
  const [selected, setSelected] = useState<Video | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const sorted = useMemo(() => [...videos].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [videos])

  function onTogglePublish(v: Video) {
    togglePublished(v.id)
    toast({
      title: v.published ? "Unpublished" : "Published",
      description: v.published ? "Your video is now hidden." : "Your video is live and visible.",
    })
  }

  function onEdit(v: Video) {
    setSelected(v)
    setEditOpen(true)
  }

  function onDeleteRequest(v: Video) {
    setPendingDeleteId(v.id)
  }

  function onConfirmDelete() {
    if (!pendingDeleteId) return
    deleteVideo(pendingDeleteId)
    setPendingDeleteId(null)
    toast({ title: "Deleted", description: "The video has been removed." })
  }

  function onCancelDelete() {
    setPendingDeleteId(null)
  }

  const formatDate = (iso: string) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(iso))

  return (
    <main className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-semibold text-foreground text-balance mb-4">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to your dashboard. Add analytics and management widgets here.</p>

      {/* Top analytics overview */}
      <section id="analytics" className="mb-6">
        <AnalyticsCards />
      </section>

      {/* Video management list */}
      <section id="videos" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Video Management</h2>
          <p className="text-sm text-muted-foreground">Manage visibility, edit details, or remove videos.</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {sorted.map((v) => (
            <Card key={v.id} className="transition-all hover:shadow-md">
              <CardContent className="p-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Thumbnail */}
                  <div className="w-full sm:w-48 overflow-hidden rounded-md ring-1 ring-border">
                    <img
                      src={ "/placeholder.svg?height=160&width=280&query=video%20thumbnail"}
                      alt={`Thumbnail for ${v.title}`}
                      className="h-28 w-full object-cover transition-transform duration-200 hover:scale-[1.02]"
                    />
                  </div>

                  {/* Title + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-medium truncate">{v.title}</h3>
                      {v.published ? (
                        <Badge className="bg-green-600 text-white">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Unpublished</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {v.channelName} • {formatDate(v.createdAt)} • {Intl.NumberFormat().format(v.views)} views
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={v.published}
                        onCheckedChange={() => onTogglePublish(v)}
                        aria-label={v.published ? "Set as unpublished" : "Publish video"}
                      />
                      <span className="text-sm text-muted-foreground">{v.published ? "Published" : "Unpublished"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(v)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => onDeleteRequest(v)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {sorted.length === 0 && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-base">No videos yet</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Upload your first video to see it here.
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Edit modal */}
      <VideoEditDialog open={editOpen} onOpenChange={setEditOpen} video={selected} />

      {/* Delete confirmation bar */}
      {pendingDeleteId && (
        <ConfirmBar
          text="Are you sure you want to delete this video?"
          onYes={onConfirmDelete}
          onCancel={onCancelDelete}
        />
      )}
    </main>
  )
}
