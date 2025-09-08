
import { NextRequest, NextResponse } from 'next/server';
import md5 from '@/lib/md5';

const REQUEST_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_REQUEST_TOKEN;
const RESPONSE_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_RESPONSE_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let openplatform = searchParams.get('openplatform');
    if (!openplatform) {
      const verifyUrlParam = searchParams.get('verifyUrl');
      if (verifyUrlParam) {
        if (verifyUrlParam.includes('~')) {
          openplatform = verifyUrlParam;
        } else {
          console.error('[OpenPlatform] Missing signature in verifyUrl param:', verifyUrlParam);
          return NextResponse.json({ error: 'Missing signature in verifyUrl param' }, { status: 400 });
        }
      }
    }
    if (!openplatform || !REQUEST_TOKEN || !RESPONSE_TOKEN) {
      console.error('[OpenPlatform] Missing openplatform param or tokens', { openplatform, REQUEST_TOKEN, RESPONSE_TOKEN });
      return NextResponse.json({ error: 'Missing openplatform param or tokens' }, { status: 400 });
    }
    const decoded = decodeURIComponent(openplatform);
    const [verifyUrl, signature] = decoded.split('~');
    if (!verifyUrl || !signature) {
      console.error('[OpenPlatform] Invalid openplatform param', { decoded, verifyUrl, signature });
      return NextResponse.json({ error: 'Invalid openplatform param' }, { status: 400 });
    }
    const expectedSignature = md5(verifyUrl + REQUEST_TOKEN);
    if (expectedSignature !== signature) {
      console.error('[OpenPlatform] Invalid signature', {
        verifyUrl,
        signature,
        expectedSignature,
        REQUEST_TOKEN,
        verifyUrlPlusToken: verifyUrl + REQUEST_TOKEN,
      });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
    const responseSignature = md5(signature + RESPONSE_TOKEN);
    console.log('[OpenPlatform] Signature validated. Calling verifyUrl:', {
      verifyUrl,
      signature,
      responseSignature,
    });
    const res = await fetch(verifyUrl, {
      headers: { 'x-token': responseSignature },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
