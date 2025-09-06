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
        console.log('[OpenPlatform] OpenPlatform param:', openplatform);
        if (!openplatform) {
          console.warn('[OpenPlatform] No openplatform param in URL');
          setUser(null);
          setLoading(false);
          return;
        }

        // You must set these to your app's tokens from OpenPlatform admin
        const REQ_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_REQUEST_TOKEN || '';
        const RES_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_RESPONSE_TOKEN || '';
        if (!REQ_TOKEN || !RES_TOKEN) {
          console.error('[OpenPlatform] Tokens not set', { REQ_TOKEN, RES_TOKEN });
          setUser(null);
          setLoading(false);
          return;
        }

        // openplatform param is encoded, decode it
        const decoded = decodeURIComponent(openplatform);
        console.log('[OpenPlatform] Decoded param:', decoded);
        // Split signature
        const [verifyUrl, signature] = decoded.split('~');
        console.log('[OpenPlatform] Verify URL and signature:', { verifyUrl, signature });
        if (!verifyUrl || !signature) {
          console.error('[OpenPlatform] Invalid openplatform param format', { decoded });
          setUser(null);
          setLoading(false);
          return;
        }
        // Validate signature
        const expectedSig = md5(verifyUrl + REQ_TOKEN);
        console.log('[OpenPlatform] Expected signature:', expectedSig);
        if (expectedSig !== signature) {
          console.error('[OpenPlatform] Signature invalid', { verifyUrl, expectedSig, signature });
          setUser(null);
          setLoading(false);
          return;
        }
  // Sign for response (must be signature + RES_TOKEN, then MD5)
  const responseSignature = md5(signature + RES_TOKEN);
  console.log('[OpenPlatform] Fetching user profile via API route', { verifyUrl, responseSignature, signatureSnippet: signature?.slice(0,8) });
        // Fetch user profile via API route to bypass CORS
        const res = await fetch(`/api/openplatform-verify?verifyUrl=${encodeURIComponent(verifyUrl)}`, {
          method: 'GET',
          headers: {
            'x-token': responseSignature,
          },
        });
        console.log('[OpenPlatform] Fetch response status:', res.status, res.statusText);
        if (!res.ok) {
          console.error('[OpenPlatform] Profile fetch failed', { status: res.status, statusText: res.statusText });
          setUser(null);
          setLoading(false);
          return;
        }
        const userData = await res.json();
        console.log('[OpenPlatform] Raw user data received:', userData);
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
        console.log('[OpenPlatform] Mapped user object:', mappedUser);
        setUser(mappedUser);
      } catch (err) {
        console.error('[OpenPlatform] Exception during auth', err);
        setUser(null);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  return { user, loading };
}
