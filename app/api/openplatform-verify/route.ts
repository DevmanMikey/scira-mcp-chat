
import { NextRequest, NextResponse } from 'next/server';
import md5 from '@/lib/md5';

const REQUEST_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_REQUEST_TOKEN;
const RESPONSE_TOKEN = process.env.NEXT_PUBLIC_OPENPLATFORM_RESPONSE_TOKEN;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Accept both 'openplatform' and 'verifyUrl' for compatibility
    let openplatform = searchParams.get('openplatform');
    if (!openplatform) {
      // If 'verifyUrl' is present, treat it as a legacy/alternate param
      const verifyUrlParam = searchParams.get('verifyUrl');
      if (verifyUrlParam) {
        // If the value contains a '~', treat it as the full openplatform string
        if (verifyUrlParam.includes('~')) {
          openplatform = verifyUrlParam;
        } else {
          // Otherwise, treat it as just the verifyUrl (no signature)
          return NextResponse.json({ error: 'Missing signature in verifyUrl param' }, { status: 400 });
        }
      }
    }
    if (!openplatform || !REQUEST_TOKEN || !RESPONSE_TOKEN) {
      return NextResponse.json({ error: 'Missing openplatform param or tokens' }, { status: 400 });
    }
    // openplatform param is a URL-encoded string like:
    // https://openplatform.com/verify/?token=123456~SIGNATURE
    const decoded = decodeURIComponent(openplatform);
    const [verifyUrl, signature] = decoded.split('~');
    if (!verifyUrl || !signature) {
      return NextResponse.json({ error: 'Invalid openplatform param' }, { status: 400 });
    }
    // Validate signature
    if (md5(verifyUrl + REQUEST_TOKEN) !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }
    // Create response signature
    const responseSignature = md5(signature + RESPONSE_TOKEN);
    // Call verifyUrl with x-token header
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
