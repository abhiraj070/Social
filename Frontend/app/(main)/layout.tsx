"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/app-shell";
import { useAuth } from "@/lib/auth-context";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return null;

  return <AppShell>{children}</AppShell>;
}
