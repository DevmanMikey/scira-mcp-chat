

import { NextRequest } from 'next/server';
import md5 from '@/lib/md5';

// Optional environment tokens (may be required by self-hosted OpenPlatform verification)
const REQUEST_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_REQUEST_TOKEN || '';
const RESPONSE_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_RESPONSE_TOKEN || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let openplatform = searchParams.get('openplatform');
  if (!openplatform) {
    // Backwards compatibility: some callers still pass the full token under verifyUrl
    const legacy = searchParams.get('verifyUrl');
    if (legacy) openplatform = legacy;
  }
  if (!openplatform) {
    return new Response(JSON.stringify({ error: 'Missing openplatform token' }), { status: 401 });
  }
  try {
    const decoded = decodeURIComponent(openplatform);
    // Format expected: <verifyUrl-without-signature>~<signature>
    const tildeIndex = decoded.lastIndexOf('~');
    if (tildeIndex === -1) {
      return new Response(JSON.stringify({ error: 'Malformed token (no signature separator)' }), { status: 400 });
    }
    const verifyUrl = decoded.substring(0, tildeIndex);
    const signature = decoded.substring(tildeIndex + 1);

    // Optional local validation (won't block if mismatch, just logs) – some deployments use md5(verifyUrl + REQUEST_TOKEN)
    if (REQUEST_TOKEN) {
      const expected = md5(verifyUrl + REQUEST_TOKEN);
      if (expected !== signature) {
        console.warn('[OpenPlatform] Signature mismatch (continuing anyway)', { verifyUrl, signature, expected });
      }
    }

    // Prepare headers (only include if we have response token + signature)
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    if (RESPONSE_TOKEN) {
      // Typical pattern: x-token = md5(signature + RESPONSE_TOKEN)
      headers['x-token'] = md5(signature + RESPONSE_TOKEN);
    }
    // Also include the raw signature & full token for broader compatibility
    headers['x-openplatform-signature'] = signature;
    headers['x-openplatform-token'] = decoded;

    let res = await fetch(verifyUrl, { headers });

    // If first attempt fails with 400/401, retry without custom headers except accept
    if (!res.ok && (res.status === 400 || res.status === 401)) {
      console.warn('[OpenPlatform] First verify attempt failed, retrying without auth headers', { status: res.status });
      res = await fetch(verifyUrl);
    }

    const text = await res.text();
    let json: any;
    try {
      json = JSON.parse(text);
    } catch (_e) {
      return new Response(JSON.stringify({ error: 'Non-JSON verify response', raw: text }), { status: 502 });
    }

    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Verify failed', status: res.status, body: json }), { status: res.status });
    }

    // Return profile (assuming the verify endpoint returns profile object or array)
    return new Response(JSON.stringify({ profile: json, signature, verifyUrl }), { status: 200 });
  } catch (err: any) {
    console.error('[OpenPlatform] Verification error', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
