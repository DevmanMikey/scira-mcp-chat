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
    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-token': responseSignature,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from OpenPlatform' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
