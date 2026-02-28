"use client";

import Link from "next/link";
import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "./theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export function TopNav() {
  const [query, setQuery] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  const profilename = user?.fullName || "YOU";
  const profileusername = user?.username || "you";

  function onSearch(e) {
    e.preventDefault();
    toast({ title: "Search", description: `You searched for "${query}"` });
  }

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // Even if the API call fails, clear local state
    }
    localStorage.removeItem("fullName");
    localStorage.removeItem("username");
    router.push("/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link href="/" className="font-semibold cursor-pointer">
          <span className="rounded-md bg-primary px-2 py-1 text-primary-foreground">
            S
          </span>
          <span className="ml-2">Social</span>
        </Link>

        <form
          onSubmit={onSearch}
          className="hidden flex-1 items-center gap-2 md:flex"
        >
          <div className="relative flex w-full items-center">
            <Search className="pointer-events-none absolute left-2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search videos, users, tweets"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search videos, users, tweets"
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none ring-0 cursor-pointer">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.avatar || "/stylized-user-avatar.png"}
                  alt="User avatar"
                />
                <AvatarFallback>{profilename?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 p-0 overflow-visible z-50"
            >
              {/* Profile panel header */}
              <div className="relative h-20 w-full overflow-hidden rounded-t-md">
                <img
                  src={user?.coverImage || "/abstract-profile-cover.png"}
                  alt="Cover"
                  className="h-full w-full object-cover"
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-10">
                  <Avatar className="h-12 w-12 border-4 border-background shadow-md">
                    <AvatarImage
                      src={user?.avatar || "/stylized-user-avatar.png"}
                      alt="User avatar"
                    />
                    <AvatarFallback>{profilename?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
              <div className="pt-8 px-4 pb-3 text-center">
                <p className="text-sm font-medium leading-tight">
                  {profilename}
                </p>
                <p className="text-xs text-muted-foreground">
                  @{profileusername}
                </p>
              </div>
              <DropdownMenuSeparator />
              <div className="p-2">
                <DropdownMenuItem className="cursor-pointer">
                  <Link href="/profile" className="w-full">
                    View Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={async (e) => {
                    e.preventDefault();
                    await handleLogout();
                  }}
                >
                  Logout
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile search */}
      <div className="border-t px-4 py-2 md:hidden">
        <form onSubmit={onSearch} className="flex items-center gap-2">
          <div className="relative flex w-full items-center">
            <Search className="pointer-events-none absolute left-2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search videos, users, tweets"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search videos, users, tweets"
            />
          </div>
          <Button type="submit" variant="secondary">
            Go
          </Button>
        </form>
      </div>
    </header>
  );
}
