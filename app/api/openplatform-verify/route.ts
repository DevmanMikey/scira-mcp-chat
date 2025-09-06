import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { verifyUrl, responseSignature } = await request.json();

    if (!verifyUrl || !responseSignature) {
      return NextResponse.json({ error: 'Missing verifyUrl or responseSignature' }, { status: 400 });
    }

    const res = await fetch(verifyUrl, {
      headers: { 'x-token': responseSignature },
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
