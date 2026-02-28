"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { authApi } from "@/lib/api";

export default function HistoryPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // The backend doesn't have a dedicated watch-history endpoint yet.
    // When one is added (e.g. GET /api/v1/users/watch-history), swap it here.
    // For now we use the current-user's watchHistory field if populated.
    authApi
      .getCurrentUser()
      .then((data: any) => {
        setHistory(Array.isArray(data.watchHistory) ? data.watchHistory : []);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-balance text-xl font-semibold">Watch History</h2>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="space-y-3">
        {history.map((v: any, i: number) => (
          <Card key={v._id || v.id || i}>
            <CardContent className="flex items-center gap-3 p-3">
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded">
                <Image
                  src={v.thumbnail || "/placeholder.svg"}
                  alt={`${v.title || "Video"} thumbnail`}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{v.title || "Untitled"}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {v.owner?.fullName || v.owner?.username || "Unknown"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!loading && history.length === 0 && (
        <p className="text-sm text-muted-foreground">No watch history yet.</p>
      )}
    </div>
  );
}
