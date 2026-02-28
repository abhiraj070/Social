"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, Users } from "lucide-react";
import { useVideos } from "@/lib/use-videos";

export function AnalyticsCards() {
  const { stats } = useVideos();
  const items = [
    { label: "Total Likes", value: stats.totalLikes, icon: Heart },
    { label: "Subscribers", value: stats.subscribers, icon: Users },
    { label: "Total Views", value: stats.totalViews, icon: Eye },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map(({ label, value, icon: Icon }) => (
        <Card key={label} className="transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
