import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verifyUrl = searchParams.get('verifyUrl');
    const responseSignature = request.headers.get('x-token');

    if (!verifyUrl || !responseSignature) {
      return NextResponse.json({ error: 'Missing verifyUrl or responseSignature' }, { status: 400 });
    }

    const url = new URL(verifyUrl);
    // Safe debug: log verifyUrl and an abbreviated x-token (do NOT log full secrets in production)
    console.log('[openplatform-verify] verifyUrl=', verifyUrl);
    console.log('[openplatform-verify] x-token (first8)=', responseSignature ? responseSignature.slice(0, 8) : null);

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-token': responseSignature,
      },
    });

    if (!res.ok) {
      // try to read error body for debugging
      let bodyText = '';
      try {
        bodyText = await res.text();
      } catch (e) {
        bodyText = '<unreadable response body>';
      }
      console.error('[openplatform-verify] OpenPlatform fetch failed', { status: res.status, bodyText });
      return NextResponse.json({ error: 'Failed to fetch from OpenPlatform', details: bodyText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
