

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const openplatform = searchParams.get('openplatform');
  if (!openplatform) {
    return new Response(JSON.stringify({ error: 'Missing openplatform token' }), { status: 401 });
  }
  try {
    // Forward the token as a query param to the OpenPlatform verify endpoint
    const verifyUrl = `https://openplatform.totaljs.com/verify?openplatform=${encodeURIComponent(openplatform)}`;
    const res = await fetch(verifyUrl);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }
    const profile = await res.json();
    return new Response(JSON.stringify(profile), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
