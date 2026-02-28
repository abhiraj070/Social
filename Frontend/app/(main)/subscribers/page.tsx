"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { subscriptionApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SubscribersPage() {
  const { user } = useAuth();
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    subscriptionApi
      .getSubscribers(user._id)
      .then((data: any) => setSubscribers(Array.isArray(data) ? data : []))
      .catch(() => setSubscribers([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="space-y-4">
      <h2 className="text-balance text-xl font-semibold">Subscribers</h2>
      {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {subscribers.map((s: any) => {
          const sub = s.subscriber || s;
          return (
            <Card key={s._id || sub._id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Image
                  src={sub.avatar || "/placeholder.svg"}
                  alt={`${sub.fullName || sub.username || "User"} avatar`}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">{sub.fullName || sub.username || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">@{sub.username || ""}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {!loading && subscribers.length === 0 && (
        <p className="text-sm text-muted-foreground">No subscribers yet.</p>
      )}
    </div>
  );
}
