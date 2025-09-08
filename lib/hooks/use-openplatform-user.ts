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



  useEffect(() => {
    // Only parse ?openplatform=... and pass to API route, let backend/sidecar handle validation
    async function fetchUser() {
      setLoading(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const openplatform = params.get('openplatform');
        if (!openplatform) {
          setUser(null);
          setLoading(false);
          return;
        }
        // Pass openplatform param to API route, which proxies to sidecar
        const res = await fetch(`/api/openplatform-verify?verifyUrl=${encodeURIComponent(decodeURIComponent(openplatform))}`, {
          method: 'GET',
          headers: {
            // No need for x-token, backend will handle
          },
        });
        if (!res.ok) {
          setUser(null);
          setLoading(false);
          return;
        }
        const userData = await res.json();
        // Map missing fields to ensure the user object matches expected shape
        const mappedUser = {
          ...userData,
          portal: userData.portal || null,
          openplatformid: userData.openplatformid || userData.id || '',
          notify: userData.notify || '',
          dtcreated: userData.dtcreated || '',
          dtupdated: userData.dtupdated || '',
          permissions: userData.permissions || [],
          groups: userData.groups || [],
        };
        setUser(mappedUser);
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  return { user, loading };
}
