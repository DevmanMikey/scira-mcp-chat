

import { NextRequest } from 'next/server';
import md5 from '@/lib/md5';

const REQUEST_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_REQUEST_TOKEN || '';
const RESPONSE_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_RESPONSE_TOKEN || '';
const DEBUG = process.env.NEXT_PUBLIC_OPENPLATFORM_DEBUG === '1';

export async function GET(request: NextRequest) {
  const started = Date.now();
  const { searchParams } = new URL(request.url);
  let openplatform = searchParams.get('openplatform');
  if (!openplatform) {
    const legacy = searchParams.get('verifyUrl');
    if (legacy) openplatform = legacy;
  }
  if (!openplatform) {
    return json(401, { error: 'Missing openplatform token' });
  }
  try {
    const decoded = decodeURIComponent(openplatform);
    const tildeIndex = decoded.lastIndexOf('~');
    if (tildeIndex === -1) {
      return json(400, { error: 'Malformed token (no signature separator)', tokenSample: decoded.slice(0, 120) });
    }
    const verifyUrl = decoded.substring(0, tildeIndex);
    const signature = decoded.substring(tildeIndex + 1);

    let expected: string | null = null;
    if (REQUEST_TOKEN) {
      expected = md5(verifyUrl + REQUEST_TOKEN);
      if (expected !== signature) {
        console.warn('[OpenPlatform] Signature mismatch (non-blocking)', { expected, signature });
      }
    }

    const attemptHeaders: Record<string, string> = { 'Accept': 'application/json' };
    if (RESPONSE_TOKEN) attemptHeaders['x-token'] = md5(signature + RESPONSE_TOKEN);
    attemptHeaders['x-openplatform-signature'] = signature;
    attemptHeaders['x-openplatform-token'] = decoded;

    const attempt1 = await fetch(verifyUrl, { headers: attemptHeaders });
    let retry: Response | null = null;
    if (!attempt1.ok && (attempt1.status === 400 || attempt1.status === 401)) {
      retry = await fetch(verifyUrl);
    }

    const finalRes = retry || attempt1;
    const rawBody = await finalRes.text();
    let body: any = rawBody;
    try { body = JSON.parse(rawBody); } catch { /* leave as text */ }

    const basePayload: any = {
      verifyUrl,
      signature,
      expectedSignature: expected,
      attempt: {
        status: attempt1.status,
        ok: attempt1.ok,
      },
      retry: retry ? { status: retry.status, ok: retry.ok } : null,
      durationMs: Date.now() - started,
    };

    if (!finalRes.ok) {
      return json(finalRes.status, { ...basePayload, error: 'Verify failed', body });
    }

    return json(200, { ...basePayload, profile: body, success: true });
  } catch (err: any) {
    console.error('[OpenPlatform] Verification error', err);
    return json(500, { error: 'Internal Server Error', message: err?.message });
  }
}

function json(status: number, data: any) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}
