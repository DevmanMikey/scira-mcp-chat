
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let openplatform = searchParams.get('openplatform');
    if (!openplatform) {
      const verifyUrlParam = searchParams.get('verifyUrl');
      if (verifyUrlParam) {
        openplatform = verifyUrlParam;
      }
    }
    if (!openplatform) {
      console.log('[OpenPlatform] Missing openplatform param', { url: request.url });
      return NextResponse.json({ error: 'Missing openplatform param' }, { status: 400 });
    }
    const decoded = decodeURIComponent(openplatform);
    const lastTilde = decoded.lastIndexOf('~');
    if (lastTilde === -1) {
      console.log('[OpenPlatform] Invalid openplatform param', { decoded });
      return NextResponse.json({ error: 'Invalid openplatform param' }, { status: 400 });
    }
    const verifyUrl = decoded.substring(0, lastTilde);
    console.log('[OpenPlatform] Calling verifyUrl', { verifyUrl, token: decoded });
    const res = await fetch(verifyUrl, {
      method: 'GET',
      headers: {
        'x-openplatform-token': decoded,
      },
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log('[OpenPlatform] Non-JSON response from verifyUrl', { text });
      return NextResponse.json({ error: 'Non-JSON response from verifyUrl', raw: text }, { status: 502 });
    }
    console.log('[OpenPlatform] verifyUrl response', { status: res.status, data });
    // If the response contains user profile data, return it for use in the sidebar
    return NextResponse.json({ profile: data, status: res.status }, { status: res.status });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
