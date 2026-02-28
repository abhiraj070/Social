"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { VideoCard } from "@/components/video-card";
import { cn } from "@/lib/utils";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { useAuth } from "@/lib/auth-context";
import { tweetApi, subscriptionApi, authApi } from "@/lib/api";
import api from "@/lib/api";

type TabKey = "videos" | "playlists" | "tweets" | "following";

interface Tweet {
  _id: string;
  content: string;
  createdAt: string;
  owner?: any;
}

export default function ProfilePage() {
  const [tab, setTab] = useState<TabKey>("videos");
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [tweetText, setTweetText] = useState("");
  const { toast } = useToast();
  const [openEdit, setOpenEdit] = useState(false);
  const { user, refreshUser } = useAuth();
  const [follow, setFollow] = useState("Follow");
  const [profileData, setProfileData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [following, setFollowing] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const profilename = user?.fullName || "You";
  const profileusername = user?.username || "you";

  // Fetch profile, videos, tweets, playlists on mount
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // Fetch channel profile data (includes sub counts)
    authApi
      .getProfile(user.username)
      .then((data: any) => setProfileData(data))
      .catch(() => {});

    // Fetch user's videos
    api
      .get("/video/publish-video")
      .then((res) => {
        const list = Array.isArray(res.data.data) ? res.data.data : [];
        setVideos(list);
      })
      .catch(() => setVideos([]));

    // Fetch user's tweets
    tweetApi
      .getUserTweets(user._id)
      .then((data: any) => setTweets(Array.isArray(data) ? data : []))
      .catch(() => setTweets([]));

    // Fetch subscribed channels (following)
    subscriptionApi
      .getSubscribedChannels(user._id)
      .then((data: any) => setFollowing(Array.isArray(data) ? data : []))
      .catch(() => setFollowing([]));

    setLoading(false);
  }, [user]);

  function followToggle() {
    if (!user) return;
    // Toggle subscription for the user's own channel (or another user)
    subscriptionApi
      .toggle(user._id)
      .then(() => {
        const next = follow === "Follow" ? "Unfollow" : "Follow";
        setFollow(next);
        toast({
          title: next === "Unfollow" ? "Unfollowed" : "Followed",
          description:
            next === "Unfollow"
              ? `You unfollowed ${profilename}`
              : `You are now following ${profilename}`,
        });
      })
      .catch((err: any) => {
        toast({
          title: "Error",
          description: err?.response?.data?.message || "Action failed",
          variant: "destructive",
        });
      });
  }

  async function postTweet() {
    if (!tweetText.trim()) return;
    try {
      const data = await tweetApi.create(tweetText.trim());
      toast({ title: "Tweet Posted" });
      setTweets([data as Tweet, ...tweets]);
      setTweetText("");
    } catch (error: any) {
      console.error(
        "postTweet error",
        error?.response?.data || error?.message || error,
      );
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "An error occurred while posting the tweet";
      toast({ title: "Error", description: message, variant: "destructive" });
    }
  }

  async function deleteTweet(id?: string) {
    if (!id) {
      console.warn("deleteTweet called without id");
      return;
    }
    try {
      await tweetApi.delete(id);
      setTweets((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.filter((t) => Boolean(t) && t._id !== id);
      });
      toast({ title: "Tweet deleted" });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Could not delete tweet",
        variant: "destructive",
      });
    }
  }

  function editProfile() {
    setOpenEdit(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-lg border bg-card">
        <div className="relative h-48 w-full">
          <Image
            src={user?.coverImage || "/abstract-profile-cover.png"}
            alt="Profile cover"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <div className="px-4 pb-4 pt-0 md:px-6">
          <div className="relative -mt-12 flex flex-col items-center text-center">
            <Avatar className="relative z-10 h-24 w-24 rounded-full ring-4 ring-background shadow-md">
              <AvatarImage src={user?.avatar || "/stylized-user-avatar.png"} alt="User avatar" />
              <AvatarFallback>{profilename?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <h1 className="mt-3 text-xl font-semibold leading-tight md:text-2xl">
              {profilename}
            </h1>
            <p className="text-sm text-muted-foreground">@{profileusername}</p>
            <p className="mt-2 max-w-prose text-pretty text-sm text-muted-foreground">
              {profileData?.bio || "Short bio goes here. Tell the world who you are."}
            </p>
            <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                <strong className="text-foreground">{profileData?.subscribersCount ?? 0}</strong> Followers
              </span>
              <span>
                <strong className="text-foreground">{profileData?.subscribedToCount ?? 0}</strong> Following
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button onClick={followToggle}>{follow}</Button>
              <Button
                variant="secondary"
                onClick={() => editProfile()}
              >
                Edit Profile
              </Button>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center gap-2 md:justify-start">
            {(["videos", "playlists", "tweets", "following"] as TabKey[]).map(
              (k) => (
                <button
                  key={k}
                  className={cn(
                    "rounded-md px-3 py-1 text-sm hover:bg-accent",
                    tab === k && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => setTab(k)}
                  aria-current={tab === k ? "page" : undefined}
                >
                  {k[0].toUpperCase() + k.slice(1)}
                </button>
              ),
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      {tab === "videos" && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v: any) => (
            <VideoCard
              key={v._id || v.id}
              video={{
                id: v._id || v.id,
                title: v.title,
                creator: v.owner?.fullName || v.owner?.username || profilename,
                thumbnail: v.thumbnail || "",
                avatar: v.owner?.avatar || user?.avatar || "",
                views: v.totalViews ?? v.views ?? 0,
                uploadDate: v.createdAt,
              }}
            />
          ))}
          {videos.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">No videos yet.</p>
          )}
        </section>
      )}

      {tab === "playlists" && (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playlists.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">No playlists yet.</p>
          )}
          {playlists.map((p: any) => (
            <Card key={p._id || p.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{p.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {p.videos?.length ?? 0} videos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {tab === "tweets" && (
        <section className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <label htmlFor="tweet" className="sr-only">
                Write a tweet
              </label>
              <textarea
                id="tweet"
                className="w-full resize-none rounded-md border bg-background p-3 text-sm outline-none focus:ring-2"
                placeholder="What's happening?"
                rows={3}
                value={tweetText}
                onChange={(e) => setTweetText(e.target.value)}
              />
              <div className="mt-2 flex justify-end">
                <Button onClick={postTweet}>Post</Button>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-2">
            {tweets.map((t) => (
              <Card key={t?._id}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm">{t.content ?? "--"}</p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {t?.createdAt
                        ? new Date(t.createdAt).toLocaleString()
                        : ""}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTweet(t._id)}
                  >
                    Delete
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {tab === "following" && (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          {following.length === 0 && (
            <p className="col-span-full text-sm text-muted-foreground">Not following anyone yet.</p>
          )}
          {following.map((f: any) => (
            <Card key={f._id || f.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <Image
                  src={f.channel?.avatar || f.avatar || "/placeholder.svg"}
                  alt={`${f.channel?.fullName || f.name || "User"} avatar`}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <div>
                  <p className="text-sm font-medium">{f.channel?.fullName || f.name || "Unknown"}</p>
                  <p className="text-xs text-muted-foreground">Following</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Edit Profile Dialog */}
      <EditProfileDialog open={openEdit} onOpenChange={setOpenEdit} />
    </div>
  );
}
