"use client";

import { useState, useEffect } from 'react';
import md5 from '../md5';

export interface OpenPlatformUser {
  id: string;
  portal: {
    name: string;
    logo: string;
    groups: Array<{ id: string; name: string }>;
    apps: Array<{ id: string; name: string; icon: string; color: string; url: string }>;
  };
  openplatformid: string;
  email: string;
  name: string;
  photo: string;
  sa: boolean;
  gender: string;
  color: string;
  darkmode: number;
  sounds: boolean;
  notifications: boolean;
  notify: string;
  openplatform: string;
  dtcreated: string;
  dtupdated: string;
  permissions: string[];
  groups: string[];
}

export function useOpenPlatformUser() {
  const [user, setUser] = useState<OpenPlatformUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams(window.location.search);
        // Canonical param is "openplatform"; still accept existing if already URL encoded full token
        const openplatform = params.get('openplatform');
        if (!openplatform) {
          setUser(null);
          setLoading(false);
          return;
        }

        const url = `/api/openplatform-verify?openplatform=${encodeURIComponent(openplatform)}`;
        const res = await fetch(url, { method: 'GET' });
        const payload = await res.json().catch(() => null);

        if (!res.ok) {
          setError(payload?.error || `Verify failed (${res.status})`);
          setDebug(payload);
          setUser(null);
          setLoading(false);
          return;
        }

        setDebug({ attempt: payload?.attempt, retry: payload?.retry, durationMs: payload?.durationMs, expectedSignature: payload?.expectedSignature, signature: payload?.signature });

        const profile = payload?.profile || payload; // fallback if backend returns raw
        if (!profile || typeof profile !== 'object') {
          setError('Invalid profile shape');
          setUser(null);
          setLoading(false);
          return;
        }

        const mappedUser: OpenPlatformUser = {
          id: profile.id || profile.openplatformid || '',
          portal: profile.portal || { name: '', logo: '', groups: [], apps: [] },
          openplatformid: profile.openplatformid || profile.id || '',
          email: profile.email || '',
          name: profile.name || '',
          photo: profile.photo || '',
          sa: !!profile.sa,
          gender: profile.gender || '',
          color: profile.color || '',
          darkmode: profile.darkmode || 0,
          sounds: !!profile.sounds,
          notifications: !!profile.notifications,
          notify: profile.notify || '',
          openplatform: profile.openplatform || '',
          dtcreated: profile.dtcreated || '',
          dtupdated: profile.dtupdated || '',
          permissions: profile.permissions || [],
          groups: profile.groups || [],
        };
        setUser(mappedUser);
      } catch (err: any) {
        setError(err?.message || 'Unexpected error');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  return { user, loading, error, debug };
}
