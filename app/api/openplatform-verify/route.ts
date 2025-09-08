
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    // Accept both 'openplatform' and 'verifyUrl' for compatibility
    let openplatform = searchParams.get('openplatform');
    if (!openplatform) {
      const verifyUrlParam = searchParams.get('verifyUrl');
      if (verifyUrlParam) {
        openplatform = verifyUrlParam;
      }
    }
    if (!openplatform) {
      return NextResponse.json({ error: 'Missing openplatform param' }, { status: 400 });
    }
    // The openplatform param is a URL-encoded string like:
    // https://openplatform.com/verify/?token=123456~SIGNATURE
    const decoded = decodeURIComponent(openplatform);
    // The verify URL is everything up to the last '~' (if present)
    const lastTilde = decoded.lastIndexOf('~');
    if (lastTilde === -1) {
      return NextResponse.json({ error: 'Invalid openplatform param' }, { status: 400 });
    }
    const verifyUrl = decoded.substring(0, lastTilde);
    // Forward the full openplatform token to the verify endpoint
    // (Official pattern: do not validate signature locally)
    const res = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        // Optionally, forward the original openplatform token for verification
        'x-openplatform-token': decoded,
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
