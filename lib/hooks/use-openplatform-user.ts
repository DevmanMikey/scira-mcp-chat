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
    // OpenPlatform integration: parse ?openplatform=... from URL
    async function fetchUser() {
      setLoading(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const openplatform = params.get('openplatform');
        if (!openplatform) {
          setLoading(false);
          return;
        }

        // You must set these to your app's tokens from OpenPlatform admin
        const REQ_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_REQUEST_TOKEN || '';
        const RES_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_RESPONSE_TOKEN || '';
        if (!REQ_TOKEN || !RES_TOKEN) {
          console.error('OpenPlatform tokens not set');
          setLoading(false);
          return;
        }

        // openplatform param is encoded, decode it
        const decoded = decodeURIComponent(openplatform);
        // Split signature
        const [verifyUrl, signature] = decoded.split('~');
        if (!verifyUrl || !signature) {
          setLoading(false);
          return;
        }
        // Validate signature
        if (md5(verifyUrl + REQ_TOKEN) !== signature) {
          console.error('OpenPlatform signature invalid');
          setLoading(false);
          return;
        }
        // Sign for response
        const responseSignature = md5(signature + RES_TOKEN);
        // Fetch user profile
        const res = await fetch(verifyUrl, {
          headers: { 'x-token': responseSignature },
        });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const userData = await res.json();
        setUser(userData);
      } catch (err) {
        setUser(null);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  return { user, loading };
}
