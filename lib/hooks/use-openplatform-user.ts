"use client";

import { useState, useEffect } from 'react';

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
    // Check for OpenPlatform user data in cookies
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
    };

    const userCookie = getCookie('openplatform_user');
    if (userCookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(userCookie));
        setUser(userData);
      } catch (error) {
        console.error('Failed to parse OpenPlatform user data:', error);
      }
    }
    setLoading(false);
  }, []);

  return { user, loading };
}
