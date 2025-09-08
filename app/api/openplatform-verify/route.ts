import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const SIDECAR_URL = process.env.NEXT_PUBLIC_SIDECAR_URL;
const APP_ID = process.env.NEXT_PUBLIC_OPENPLATFORM_APP_ID || 'scira-mcp-chat';
const JWT_SECRET = process.env.SIDECAR_JWT_SECRET;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verifyUrl = searchParams.get('verifyUrl');
    const responseSignature = request.headers.get('x-token');
    if (!verifyUrl || !responseSignature) {
      return NextResponse.json({ error: 'Missing verifyUrl or responseSignature' }, { status: 400 });
    }
    if (!SIDECAR_URL || !JWT_SECRET) {
      return NextResponse.json({ error: 'Sidecar URL or JWT secret not set' }, { status: 500 });
    }
    // Create JWT for sidecar auth
    const token = jwt.sign({ appId: APP_ID }, JWT_SECRET, { expiresIn: '5m' });
    // Proxy to sidecar
    const res = await fetch(`${SIDECAR_URL}/sidecar/openplatform-verify?verifyUrl=${encodeURIComponent(verifyUrl)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-token': responseSignature,
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
