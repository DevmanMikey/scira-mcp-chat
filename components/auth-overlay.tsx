"use client";
import React from "react";
import { useOpenPlatformUser } from "@/lib/hooks/use-openplatform-user";

export function AuthOverlay() {
  const { user, loading } = useOpenPlatformUser();
  if (user || loading) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
  <div className="text-2xl font-bold mb-4">Authentication Required</div>
  <div className="text-lg">Please sign in with Inspiraus Flow to use the app.</div>
    </div>
  );
}
