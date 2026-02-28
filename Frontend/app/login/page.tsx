"use client";

import type React from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
  }>({});
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  function validate() {
    const errs: typeof errors = {};
    if (!email && !username) {
      errs.username = "Either username or email is required";
    }
    if (email && !email.includes("@")) {
      errs.email = "Enter a valid email";
    }
    if (!password) {
      errs.password = "Password is required";
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);
    setIsSubmitting(true);
    if (!validate()) {
      setIsSubmitting(false);
      setStatus("Validation failed — check the form fields");
      return;
    }
    try {
      await authApi.login({ email, username, password });
      await refreshUser();

      setStatus("Login successful — redirecting…");
      toast({ title: "Logged in", description: "Welcome back!" });
      await new Promise((r) => setTimeout(r, 300));
      router.push("/");
    } catch (err: any) {
      setStatus("Login failed");
      if (err?.response?.data) {
        const errorMessage =
          err.response.data.message || err.response.data.error;
        toast({
          title: "Login failed",
          description: errorMessage,
          variant: "destructive",
        });
        console.error("Backend error: ", errorMessage);
      } else {
        console.error("Unexpected error: ", err.message);
        toast({
          title: "Login failed",
          description: err.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-sm animate-in fade-in-50">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="username" className="mb-1 block text-sm">
                Username
              </label>
              <Input
                id="username"
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                aria-invalid={!!errors.username}
              />
              {errors.username && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.username}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!errors.password}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.password}
                </p>
              )}
            </div>
            <Button className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </Button>
            {status && (
              <p className="mt-2 text-sm text-muted-foreground">{status}</p>
            )}
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
          Don&apos;t have an account?&nbsp;
          <Link href="/signup" className="text-primary underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
